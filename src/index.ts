import { Config } from "./interfaces/Config";
import * as File from '../config.json';
import { Bot } from "./client/Client";

new Bot().start((File as Config));
