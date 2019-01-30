import "reflect-metadata";

import { expect } from "chai";
import { Constants } from "../../../../../client/src/app/constants";
import { GameMode, ICard } from "../../../../../common/communication/iCard";
import { ICardLists } from "../../../../../common/communication/iCardLists";
import { CardManagerService } from "../../../services/card-manager.service";

const TWO: number = 2;
const THREE: number = 3;
const CARD_DELETED: string = "Carte supprimée";
const CARD_NOT_FOUND: string = "Erreur de suppression, carte pas trouvée";
const FAKE_PATH: string = Constants.BASIC_SERVICE_BASE_URL + "/api/asset/image";
let cardManagerService: CardManagerService;
let cm: ICardLists;

describe("Card-manager tests", () => {

    const c1: ICard = {
        gameID: 1,
        title: "Default 2D",
        subtitle: "default 2D",
        avatarImageUrl: FAKE_PATH + "/elon.jpg",
        gameImageUrl: FAKE_PATH + "/elon.jpg",
        gamemode: GameMode.simple,
    };

    const c2: ICard = {
        gameID: 2,
        title: "Default 3D",
        subtitle: "default 3D",
        avatarImageUrl: FAKE_PATH + "/moutain.jpg",
        gameImageUrl: FAKE_PATH + "/moutain.jpg",
        gamemode: GameMode.free,
    };

    const c3: ICard = {
        gameID: 3,
        title: "Default 3D",
        subtitle: "default 3D",
        avatarImageUrl: FAKE_PATH + "/poly.jpg",
        gameImageUrl: FAKE_PATH + "/poly.jpg",
        gamemode: GameMode.free,
    };

    beforeEach(() => {
        cardManagerService = new CardManagerService();
        cm = {
            list2D: [c1],
            list3D: [c2],
        };
    });

    it("Should return the card in the 2D list", () => {
        expect(cardManagerService.getCards().list2D).deep.equal(cm.list2D);
    });
    it("Should return the card in the 3D list", () => {
        expect(cardManagerService.getCards().list3D).deep.equal(cm.list3D);
    });
    it("should return the list of all cards", () => {
        expect(cardManagerService.getCards()).deep.equal(cm);
    });
    it("should return false when adding an existing card", () => {
        expect(cardManagerService.addCard2D(c1)).to.equal(false);
    });
    it("should return true when adding a new card", () => {
        expect(cardManagerService.addCard2D(c3)).to.equal(true);
    });
    it("should return new length of 3D list after adding a card", () => {
        cardManagerService.addCard3D(c3);
        expect(cardManagerService.getCards().list3D.length).to.equal(TWO);
    });
    it("should return the newly added card", () => {
        cardManagerService.addCard3D(c3);
        expect(cardManagerService.getCards().list3D[1]).deep.equal(c3);
    });
    it("should remove the newly added card and return true", () => {
        cardManagerService.addCard2D(c3);
        expect(cardManagerService.removeCard2D(THREE)).to.equal(CARD_DELETED);
    });
    it("should return false because the card doesnt exist", () => {
        expect(cardManagerService.removeCard2D(0)).to.equal(CARD_NOT_FOUND);
    });
    it("should return undefined because there is no more card there", () => {
        expect(cardManagerService.getCards().list3D[1]).deep.equal(undefined);
    });
});
