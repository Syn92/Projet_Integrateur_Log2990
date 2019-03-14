import "reflect-metadata";

import * as chai from "chai";
import * as spies from "chai-spies";
import * as fs from "fs";
import * as path from "path";
import SocketIO = require("socket.io");
import { mock, verify } from "ts-mockito";
import { GameMode } from "../../../../common/communication/iCard";
import { GameType, IGameRequest } from "../../../../common/communication/iGameRequest";
import { IOriginalPixelCluster, IPlayerInputResponse } from "../../../../common/communication/iGameplay";
import { IUser } from "../../../../common/communication/iUser";
import { Message } from "../../../../common/communication/message";
import { CCommon } from "../../../../common/constantes/cCommon";
import { Constants } from "../../constants";
import { Arena } from "../../services/game/arena/arena";
import { IArenaInfos, IPlayerInput } from "../../services/game/arena/interfaces";
import { GameManagerService } from "../../services/game/game-manager.service";
import { UserManagerService } from "../../services/user-manager.service";

// tslint:disable no-magic-numbers no-any await-promise no-floating-promises max-file-line-count

let gameManagerService: GameManagerService;
let userManagerService: UserManagerService;
const mockAdapter:  any = require("axios-mock-adapter");
const axios:        any = require("axios");
let mockAxios:      any;

const request2DSimple: IGameRequest = {
    username:   "Frank",
    gameId:     1,
    type:       GameType.singlePlayer,
    mode:       GameMode.simple,
};

const request3DSimple: IGameRequest = {
    username:   "Franky",
    gameId:     105,
    type:       GameType.singlePlayer,
    mode:       GameMode.free,
};

const request2DMulti: IGameRequest = {
    username:   "Frank",
    gameId:     1,
    type:       GameType.multiPlayer,
    mode:       GameMode.simple,
};

const request3DMulti: IGameRequest = {
    username:   "Franky",
    gameId:     105,
    type:       GameType.multiPlayer,
    mode:       GameMode.free,
};

const invalidRequest: IGameRequest = {
    username:   "Frankette",
    gameId:     103,
    type:       GameType.singlePlayer,
    mode:       GameMode.invalid,
};

const iArenaInfos: IArenaInfos = {
    arenaId:            1,
    users:              [{username: "Frank", socketID: "12345"}],
    originalGameUrl:    "../../../asset/image/1_original.bmp",
    differenceGameUrl:  "../../../asset/image/1_modified.bmp",
};

const playerInput: IPlayerInput = {
    event:      "onClick",
    arenaId:    1,
    user: {
        username: "Frank",
        socketID: "12345",
    },
    position: {
        x: 12,
        y: 12,
    },
};

let socket: SocketIO.Socket;
const original: Buffer = fs.readFileSync(path.resolve(__dirname, "../../asset/image/testBitmap/imagetestOg.bmp"));
const modified: Buffer = fs.readFileSync(path.resolve(__dirname, "../../asset/image/testBitmap/imagetestOg.bmp"));

beforeEach(() => {
    socket              = mock(SocketIO);
    userManagerService  = new UserManagerService();
    gameManagerService  = new GameManagerService(userManagerService);
    mockAxios           = new mockAdapter.default(axios);
});

describe("GameManagerService tests", () => {
    chai.use(spies);

    it("should add socketID in playerList", () => {

        gameManagerService.subscribeSocketID("dylan", socket);
        const result: SocketIO.Socket | undefined = gameManagerService.userList.get("dylan");
        chai.expect(result).to.be.equal(socket);
    });

    it("should add socketID in playerList", () => {

        const arena: Arena = new Arena(iArenaInfos, gameManagerService);
        gameManagerService["arenas"].set(iArenaInfos.arenaId, arena);
        const usersInArena: IUser[] = gameManagerService.getUsersInArena(iArenaInfos.arenaId);

        const isRightUsername:      boolean = usersInArena[0].username === "Frank";
        const isRightSocketId:      boolean = usersInArena[0].socketID === "12345";
        const isRightNumberOfUsers: boolean = usersInArena.length === 1;

        chai.expect(isRightSocketId && isRightUsername && isRightNumberOfUsers).to.equal(true);
    });

    it("should remove socketID in playerList", () => {

        gameManagerService.subscribeSocketID("dylan", socket);
        gameManagerService.subscribeSocketID("michelGagnon", socket);
        gameManagerService.unsubscribeSocketID("dylan", "");
        const result: SocketIO.Socket | undefined = gameManagerService.userList.get("michelGagnon");
        chai.expect(result).to.be.equal(socket);
    });

    it("Should return buildArenaInfo successfully", async () => {
        const arenaInfo: IArenaInfos = {
            arenaId:            1000,
            users:              [{username: "Frank", socketID: "12345"}],
            originalGameUrl:    Constants.PATH_TO_IMAGES + "1" + CCommon.ORIGINAL_FILE,
            differenceGameUrl:  Constants.PATH_TO_IMAGES + "1" + Constants.GENERATED_FILE,
        };
        chai.spy.on(gameManagerService, "buildArenaInfos");
        chai.expect(
            gameManagerService["buildArenaInfos"]([{username: "Frank", socketID: "12345"}], 1))
            .to.deep.equal(arenaInfo);
    });

    it("Should return a success message when creating a 2D arena", async () => {
        userManagerService.validateName(request2DSimple.username);

        mockAxios.onGet(iArenaInfos.originalGameUrl, {
            responseType: "arraybuffer",
        }).reply(200, original);

        mockAxios.onGet(iArenaInfos.differenceGameUrl, {
            responseType: "arraybuffer",
        }).reply(200, modified);

        chai.spy.on(gameManagerService, "buildArenaInfos", (returns: any) => iArenaInfos);
        chai.spy.on(gameManagerService, "init2DArena", () => {
            gameManagerService.arena.timer.stopTimer();
        });

        gameManagerService.analyseRequest(request2DSimple).then((message: any) => {
            chai.expect(message.title).to.equal("onSuccess");
        });

    });

    it("Should return a success message when creating a 3D arena", async () => {
        userManagerService.validateName(request3DSimple.username);
        const message: Message = await gameManagerService.analyseRequest(request3DSimple);
        chai.expect(message.title).to.equal("onSuccess");
    });

    it("Should return a success message when creating a 3D arena", async () => {
        userManagerService.validateName(request3DSimple.username);
        const message: Message = await gameManagerService.analyseRequest(request3DSimple);
        chai.expect(message.title).to.equal("onSuccess");
    });

    it("Should return an error message when loading an invalid game", async () => {
        userManagerService.validateName(invalidRequest.username);
        const message: Message = await gameManagerService.analyseRequest(invalidRequest);
        chai.expect(message.body).to.equal("Game mode invalide");
    });

    it("Should return an error message when username doesnt exist", async () => {
        const message: Message = await gameManagerService.analyseRequest(invalidRequest);
        chai.expect(message.body).to.equal("Utilisateur inexistant");
    });

    it("Should return an error message when loading an invalid game", async () => {
        const ON_ERROR_ORIGINAL_PIXEL_CLUSTER: IOriginalPixelCluster = { differenceKey: -1, cluster: [] };
        const expectedMessage: IPlayerInputResponse = {
            status:     CCommon.ON_ERROR,
            response:   ON_ERROR_ORIGINAL_PIXEL_CLUSTER,
        };
        chai.expect(await gameManagerService.onPlayerInput(playerInput)).to.deep.equal(expectedMessage);
    });

    it("Should return error if arena have been created", async () => {
        userManagerService.validateName(request2DSimple.username);

        mockAxios.onGet(iArenaInfos.originalGameUrl, {
            responseType: "arraybuffer",
        }).reply(200, original);

        mockAxios.onGet(iArenaInfos.differenceGameUrl, {
            responseType: "arraybuffer",
        }).reply(200, modified);

        chai.spy.on(gameManagerService, "buildArenaInfos", (returns: any) => iArenaInfos);
        chai.spy.on(gameManagerService, "init2DArena", () => {
            gameManagerService["arena"].timer.stopTimer();
        });

        gameManagerService.analyseRequest(request2DSimple).catch();

        const ON_ERROR_ORIGINAL_PIXEL_CLUSTER: IOriginalPixelCluster = { differenceKey: -1, cluster: [] };
        const expectedMessage: IPlayerInputResponse = {
            status:     CCommon.ON_ERROR,
            response:   ON_ERROR_ORIGINAL_PIXEL_CLUSTER,
        };
        chai.expect(await gameManagerService.onPlayerInput(playerInput)).to.deep.equal(expectedMessage);
    });

    it("should remove player patate from arena", async () => {
        userManagerService.validateName(request2DSimple.username);

        mockAxios.onGet(iArenaInfos.originalGameUrl, {
            responseType: "arraybuffer",
        }).reply(200, original);

        mockAxios.onGet(iArenaInfos.differenceGameUrl, {
            responseType: "arraybuffer",
        }).reply(200, modified);

        chai.spy.on(gameManagerService, "buildArenaInfos", (returns: any) => iArenaInfos);
        chai.spy.on(gameManagerService, "init2DArena", async () => {
            await gameManagerService["arena"].timer.stopTimer();
        });

        gameManagerService.analyseRequest(request2DSimple).catch();
        gameManagerService.unsubscribeSocketID("12345", "Frank");
        chai.expect(gameManagerService["arena"].getPlayers().length).to.deep.equal(0);
    });

    it("should delete arena succesfully", async () => {
        userManagerService.validateName(request2DSimple.username);
        mockAxios.onGet(iArenaInfos.originalGameUrl, {
            responseType: "arraybuffer",
        }).reply(200, original);

        mockAxios.onGet(iArenaInfos.differenceGameUrl, {
            responseType: "arraybuffer",
        }).reply(200, modified);

        chai.spy.on(gameManagerService, "buildArenaInfos", (returns: any) => iArenaInfos);
        chai.spy.on(gameManagerService, "init2DArena", () => {
            gameManagerService["arena"].timer.stopTimer();
        });

        const spy: any = chai.spy.on(gameManagerService["arenas"], "delete");

        gameManagerService.analyseRequest(request2DSimple).catch();
        gameManagerService.deleteArena(iArenaInfos.arenaId);
        chai.expect(spy).to.have.been.called();

    });

    it("Should send message with socket", async () => {
        gameManagerService = new GameManagerService(userManagerService);
        gameManagerService.subscribeSocketID("socketID", socket);
        gameManagerService.sendMessage("socketID", "onEvent", 1);
        verify(socket.emit("onEvent", 1)).atLeast(0);
    });

    it("Should return a message saying onWaiting when no one is in the lobby", async () => {
        userManagerService["users"].push({username: "Frank", socketID: "Frank"});
        const response: Message = await gameManagerService.analyseRequest(request2DMulti);
        chai.expect(response.body).to.deep.equal(CCommon.ON_WAITING);
    });

    it("Should return a message saying onWaiting when no one is in the lobby (2D)", async () => {

        const request: IGameRequest = {
            username:   "Franky",
            gameId:     1,
            type:       GameType.multiPlayer,
            mode:       GameMode.simple,
        };

        userManagerService["users"].push({username: "Franky", socketID: "Franky"});
        userManagerService["users"].push({username: "Frank", socketID: "Frank"});
        await gameManagerService.analyseRequest(request);
        const response: Message = await gameManagerService.analyseRequest(request2DMulti);
        chai.expect(response.title).to.deep.equal(CCommon.ON_SUCCESS);
    });


    it("Should return an error message when deleting an unexisting arena", async () => {
        chai.expect(gameManagerService.cancelRequest(2).title).to.deep.equal(CCommon.ON_ERROR);
    });

    it("Should return a success message when deleting an existing arena", async () => {
        const user: IUser = {username: "Frank", socketID: "Frank"};
        gameManagerService["lobby"].set(1, [user]);
        chai.expect(gameManagerService.cancelRequest(1).title).to.deep.equal(CCommon.ON_SUCCESS);
    });
});
