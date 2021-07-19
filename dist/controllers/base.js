"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const request_promise_1 = __importDefault(require("request-promise"));
const nylas_1 = __importDefault(require("nylas"));
const redirectURI = process.env.REDIRECT_URI ||
    "https://nylas-customer-example-nodejs.herokuapp.com/login_callback";
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    const accessToken = req.session["access_token"];
    if (!accessToken) {
        res.render("base", {
            login_href: nylas_1.default.urlForAuthentication({
                redirectURI,
                scopes: ["calendar"]
            }),
            insecure_override: req.protocol !== "https",
            partials: { authorization_partial: "partials/before_authorized" }
        });
        return;
    }
    const nylas = nylas_1.default.with(accessToken);
    const account = await nylas.account.get();
    // If the user has already connected to Nylas via OAuth,
    // `nylas.authorized` will be true. Otherwise, it will be false.
    const pages = await request_promise_1.default.get({
        uri: "https://schedule.api.nylas.com/manage/pages",
        headers: { Authorization: `Bearer ${accessToken}` },
        json: true
    });
    res.render("base", {
        pages,
        account,
        accessToken,
        partials: { authorization_partial: "partials/after_authorized" }
    });
});
router.post("/", async (req, res) => {
    const accessToken = req.session["access_token"];
    if (!accessToken) {
        res.redirect("/");
        return;
    }
    const newPage = await request_promise_1.default.post({
        uri: "https://schedule.api.nylas.com/manage/pages",
        json: true,
        body: {
            name: req.body["name"],
            slug: req.body["slug"],
            access_tokens: [accessToken],
            config: {
                // You can provide as few or as many page configuration options as you like.
                // Check out the Scheduling Page documentation for a full list of settings.
                event: {
                    title: req.body["event_title"]
                }
            }
        }
    });
    res.redirect("/");
});
router.get("/login_callback", async (req, res) => {
    if (req.query.error) {
        res.status(400).send(`Login error: ${req.query["error"]}`);
        return;
    }
    const token = await nylas_1.default.exchangeCodeForToken(req.query.code);
    // save the token to the current session, save it to the user model, etc.
    req.session["access_token"] = token;
    res.redirect("/");
});
router.get("/custom_callback", async (req, res) => {
    console.log(req);
});
exports.default = router;
//# sourceMappingURL=base.js.map