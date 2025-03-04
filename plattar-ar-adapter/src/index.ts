export * as PlattarWeb from "@plattar/plattar-web";
export * as PlattarQRCode from "@plattar/plattar-qrcode";

export * as version from "./version";
export { ConfiguratorAR } from "./ar/configurator-ar";
export { ProductAR } from "./ar/product-ar";
export { SceneAR } from "./ar/scene-ar";
export { Util } from "./util/util";

import PlattarEmbed from "./embed/plattar-embed";
import version from "./version";

if (customElements) {
    customElements.define("plattar-embed", PlattarEmbed);
}

console.log("using @plattar/plattar-ar-adapter v" + version);