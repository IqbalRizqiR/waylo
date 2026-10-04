import {createApp} from "./app";
import {config} from "./config";

const app = createApp();

app.listen(config.port, () => {
  console.info(`[waylo-api] listening on http://localhost:${config.port}`);
});