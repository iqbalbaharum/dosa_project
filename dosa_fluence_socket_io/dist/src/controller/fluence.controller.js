"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fluence_1 = require("@fluencelabs/fluence");
const fluence_network_environment_1 = require("@fluencelabs/fluence-network-environment");
const game_oracle_1 = require("../_aqua/game_oracle");
class FluenceController {
    constructor() {
        this.start();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fluence_1.Fluence.start({ connectTo: fluence_network_environment_1.krasnodar[0] });
            console.log(fluence_1.Fluence.getStatus().peerId);
        });
    }
    get_rockets(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, game_oracle_1.fetch_user_rocket)(address);
        });
    }
}
exports.default = FluenceController;
