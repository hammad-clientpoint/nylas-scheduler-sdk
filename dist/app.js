"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_flash_1 = __importDefault(require("express-flash"));
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression")); // compresses requests
const consolidate_1 = __importDefault(require("consolidate"));
const lusca_1 = __importDefault(require("lusca"));
const path_1 = __importDefault(require("path"));
const nylas_1 = __importDefault(require("nylas"));
// Controllers (route handlers)
const base_1 = __importDefault(require("./controllers/base"));
const NylasClientID = process.env["NYLAS_OAUTH_CLIENT_ID"];
const NylasClientSecret = process.env["NYLAS_OAUTH_CLIENT_SECRET"];
if (!NylasClientID || !NylasClientSecret) {
    console.warn(`
    To run this example, pass the NYLAS_OAUTH_CLIENT_ID and NYLAS_OAUTH_CLIENT_SECRET
    environment variables when launching the service. eg:\n
    REDIRECT_URI=https://ad172180.ngrok.io/login_callback NYLAS_OAUTH_CLIENT_ID=XXX NYLAS_OAUTH_CLIENT_SECRET=XXX npm start
  `);
    process.exit(1);
}
// Configure Nylas
nylas_1.default.config({
    appId: NylasClientID,
    appSecret: NylasClientSecret
});
// Create Express server
const app = express_1.default();
// assign the mustache enging to .mustache files
app.engine("mustache", consolidate_1.default.mustache);
// Express configuration
app.set("port", process.env["PORT"] || 5000);
app.set("views", path_1.default.join(__dirname, "../views"));
app.set("view engine", "mustache");
app.use(compression_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_session_1.default({
    resave: true,
    saveUninitialized: true,
    secret: process.env["SECRET_KEY"] || "test-secret",
    cookie: { maxAge: 60000 }
}));
app.use(express_flash_1.default());
app.use(lusca_1.default.xframe("SAMEORIGIN"));
app.use(lusca_1.default.xssProtection(true));
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), { maxAge: 31557600000 }));
app.use(base_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map