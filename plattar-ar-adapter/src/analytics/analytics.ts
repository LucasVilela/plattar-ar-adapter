import { Util } from "../util/util";

interface AnalyticsDimensions {
    source: string;
    pageTitle: string;
    pageURL: string;
    referrer: string;
    user_id: string;
}

export class Analytics {
    private static readonly _DIMS = {
        source: "embed",
        pageTitle: document.title,
        pageURL: location.href,
        referrer: document.referrer,
        user_id: Analytics.getUserID()
    };

    public static track(event: any, dataSet: any | undefined = undefined) {
        const dimensions: AnalyticsDimensions = Analytics.getDimensions();

        const url: string = "https://c.plattar.space/api/v2/analytics";
        var data = dataSet || {};

        if (typeof event == 'object') {
            data = event;
            event = 'track';
        }

        Object.assign(data, dimensions);

        var analytic = {
            event: event,
            application_id: data.applicationId,
            origin: 'production',
            data: data
        };

        var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(analytic));
    }

    public static getUserID(): string {
        let userID: string | null = null;

        try {
            userID = localStorage.getItem("plattar_user_id");
        }
        catch (err) {
            userID = Util.generateUUID();
        }

        if (!userID) {
            userID = Util.generateUUID();
            localStorage.setItem("plattar_user_id", userID);
        }

        return userID;
    }

    public static getDimensions(): AnalyticsDimensions {
        return Analytics._DIMS;
    }

    public static startRecordEngagement(): void {
        let time: Date;

        const handlePageHide = () => {
            if (document.visibilityState === "hidden") {
                time = new Date();
            }
            else {
                const time2 = new Date();
                const diff = time2.getTime() - time.getTime();

                Analytics.track({
                    eventAction: 'View Time',
                    viewTime: diff,
                    eventLabel: diff
                });

                document.removeEventListener("visibilitychange", handlePageHide, false);
            }
        };

        document.addEventListener("visibilitychange", handlePageHide, false);
    }
}