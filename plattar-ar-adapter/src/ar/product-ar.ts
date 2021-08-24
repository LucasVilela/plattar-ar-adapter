import { FileModel, Product, ProductVariation, Scene, Project } from "@plattar/plattar-api";
import Analytics from "../analytics/analytics";
import Util from "../util/util";
import ARViewer from "../viewers/ar-viewer";

/**
 * Performs AR functionality related to Plattar Products and Variation types
 */
export default class ProductAR {

    // analytics instance
    private readonly _analytics: Analytics;

    // product and selected variation IDs
    private readonly _productID: string;
    private readonly _variationID: string;

    // this thing controls the actual AR view
    // this is setup via .init() function
    private _ar: ARViewer | null;

    constructor(productID: string | undefined | null = null, variationID: string | undefined | null = null) {
        if (!productID) {
            throw new Error("ProductAR.constructor(productID, variationID) - productID must be defined");
        }

        this._productID = productID;
        this._variationID = variationID ? variationID : "default";
        this._analytics = new Analytics();
        this._ar = null;
    }

    public get productID(): string {
        return this._productID;
    }

    public get variationID(): string {
        return this._variationID;
    }

    /**
     * Initialise the ProductAR instance. This returns a Promise that resolves
     * successfully if initialisation is successful, otherwise it will fail.
     * 
     * filure can occur for a number of reasons but it generally means that AR
     * cannot be performed.
     */
    public init(): Promise<ProductAR> {
        return new Promise<ProductAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ProductAR.init() - cannot proceed as AR not available in context"));
            }

            const product: Product = new Product(this.productID);
            product.include(ProductVariation);
            product.include(ProductVariation.include(FileModel));
            product.include(Scene);
            product.include(Scene.include(Project));

            product.get().then((product: Product) => {
                // find the required variation from our product
                const variationID: string | undefined = this.variationID ? (this.variationID === "default" ? product.attributes.product_variation_id : this.variationID) : product.attributes.product_variation_id;

                if (!variationID) {
                    return reject(new Error("ProductAR.init() - cannot proceed as variation was not defined correctly"));
                }

                const variation: ProductVariation | undefined = product.relationships.find(ProductVariation, variationID);

                // make sure our variation is actually available before moving forward
                if (!variation) {
                    return reject(new Error("ProductAR.init() - cannot proceed as variation with id " + variationID + " cannot be found"));
                }

                // otherwise both the product and variation are available
                // we need to figure out if we can actually do AR though
                // check if variation has a model file defined
                const modelID: string | undefined = variation.attributes.file_model_id;

                if (!modelID) {
                    return reject(new Error("ProductAR.init() - cannot proceed as variation does not have a defined file"));
                }

                // find the actual FileModel from Variation
                const model: FileModel | undefined = variation.relationships.find(FileModel, modelID);

                if (!model) {
                    return reject(new Error("ProductAR.init() - cannot proceed as ModelFile for selected variation is corrupt"));
                }

                // we need to define our AR module here
                // we are in Safari/Quicklook mode here
                if (Util.isSafari() && Util.canQuicklook()) {
                    // model needs to have either USDZ or REALITY files defined
                }
            }).catch(reject);
        });
    }

    /**
     * Initialise and launch with a single function call. this is mostly for convenience.
     * Use .init() and .start() separately for fine-grained control
     */
    public launch(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            this.init().then((value: ProductAR) => {
                value.start();

                return accept();
            }).catch(reject);
        });
    }

    /**
     * Launches the internal AR instance using an appropriate version of AR Viewers
     */
    public start(): void {
        if (!this._ar) {
            throw new Error("ProductAR.start() - cannot proceed as AR instance is null");
        }

        // this was initialised via the init() function
        this._ar.start();

        this._analytics.track({
            device: this._ar.device,
            eventCategory: this._ar.nodeType,
            eventAction: "Start Augment"
        });

        this._analytics.startRecordEngagement();
    }
}