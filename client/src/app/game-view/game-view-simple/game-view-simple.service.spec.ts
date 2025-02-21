
import { ElementRef } from "@angular/core";
import { inject, TestBed } from "@angular/core/testing";
import { CClient } from "src/app/CClient";
import { mock } from "ts-mockito";
import { IArenaResponse, IClickMessage, IOriginalPixelCluster, IPosition2D } from "../../../../../common/communication/iGameplay";
import { CCommon } from "../../../../../common/constantes/cCommon";
import { GameViewSimpleService } from "./game-view-simple.service";

// tslint:disable: no-any no-magic-numbers no-empty max-line-length no-floating-promises
const hitPosition: IPosition2D = {
  x: 1,
  y: 1,
};

const expectedPixelClusters: IOriginalPixelCluster = {
  differenceKey:  1,
  cluster: [
      {
          color: {
              R: 100,
              G: 100,
              B: 100,
          },
          position: hitPosition,
      },
  ],
};

describe("GameViewSimpleService Test", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameViewSimpleService],
    });

    let store: any = {};
    const mockLocalStorage: any = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    spyOn(sessionStorage, "getItem")
    .and.callFake(mockLocalStorage.getItem);
    spyOn(sessionStorage, "setItem")
    .and.callFake(mockLocalStorage.setItem);

    sessionStorage.setItem(CClient.USERNAME_KEY, "mike");

  });

  it("should set success sounds with value passed by parameter", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    gameViewService.setSounds(new ElementRef<any>("url/success"), new ElementRef<any>("url/fail"), new ElementRef<any>("url/opp"), new ElementRef<any>("url/won"), new ElementRef<any>("url/lost"));

    expect(gameViewService["successSound"]).toEqual(new ElementRef<any>("url/success"));
  }));

  it("should set fail sounds with value passed by parameter", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    gameViewService.setSounds(new ElementRef<any>("url/success"), new ElementRef<any>("url/fail"), new ElementRef<any>("url/opp"), new ElementRef<any>("url/won"), new ElementRef<any>("url/lost"));

    expect(gameViewService["failSound"]).toEqual(new ElementRef<any>("url/fail"));
  }));

  it("should set modified canvas with value passed by parameter", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const canvas: CanvasRenderingContext2D = mock(CanvasRenderingContext2D);
    gameViewService.setCanvas(canvas);

    expect(gameViewService["canvasModified"]).toEqual(canvas);
  }));

  it("should return an IClickMessage when canvaClick is called", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const position: IPosition2D = {
      x:    10,
      y:    15,
    };

    const arenaId:  number = 1;
    const username: string = "myname";

    const clickMessage: IClickMessage<IPosition2D> = {
      value:   {
        x: 10,
        y: 15,
      },
      arenaID:    1,
      username:   "myname",
    };

    const generatedClickMessage: IClickMessage<IPosition2D> = gameViewService.onCanvasClick(position, arenaId, username);

    expect(generatedClickMessage).toEqual(clickMessage);
  }));

  it("should play success sound when getting a success click", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    gameViewService.setSounds(mock(ElementRef), mock(ElementRef), mock(ElementRef), mock(ElementRef), mock(ElementRef));
    const spy: any = spyOn<any>(gameViewService, "playSuccessSound");
    const expectedResponse: IArenaResponse<IOriginalPixelCluster> = {
      status:     CCommon.ON_SUCCESS,
      response:   expectedPixelClusters,
      username:   "mike",
    };

    canvas.width  = 5;
    canvas.height = 5;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx) {
      gameViewService.setCanvas(ctx);
      gameViewService.onArenaResponse(expectedResponse);
      expect(spy).toHaveBeenCalled();
    }
  }));

  it("should not play success sound when getting a bad click", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const spy: any = spyOn<any>(gameViewService, "playSuccessSound");
    const expectedResponse: IArenaResponse<IOriginalPixelCluster> = {
      status:     CCommon.ON_ERROR,
      response:   undefined,
    };
    gameViewService.onArenaResponse(expectedResponse);
    expect(spy).not.toHaveBeenCalled();
  }));

  it("should change pixel on canvas on goodClick", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const expectedResponse: IArenaResponse<IOriginalPixelCluster> = {
      status:     CCommon.ON_SUCCESS,
      response:   expectedPixelClusters,
      username:   "mike",
    };
    spyOn<any>(gameViewService, "playSuccessSound").and.returnValue(() => {});
    gameViewService.setSounds(mock(ElementRef), mock(ElementRef), mock(ElementRef), mock(ElementRef), mock(ElementRef));
    canvas.width  = 5;
    canvas.height = 5;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx) {
      gameViewService.setCanvas(ctx);
      const spy: any = spyOn<any>(gameViewService["canvasModified"], "fillRect");
      gameViewService.onArenaResponse(expectedResponse);
      expect(spy).toHaveBeenCalled();
    }
  }));

  it("should play htmlaudio success sound on good hit", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const expectedResponse: IArenaResponse<IOriginalPixelCluster> = {
      status:     CCommon.ON_SUCCESS,
      response:   expectedPixelClusters,
      username:   "mike",
    };

    const audio1: HTMLAudioElement = document.createElement("audio");
    const audio2: HTMLAudioElement = document.createElement("audio");
    const successSound: ElementRef = new ElementRef<HTMLAudioElement>(audio1);
    const failsound:    ElementRef = new ElementRef<HTMLAudioElement>(audio2);
    gameViewService.setSounds(successSound, failsound, mock(ElementRef), mock(ElementRef), mock(ElementRef));
    const spy: any = spyOn(gameViewService["successSound"].nativeElement, "play");
    canvas.width  = 5;
    canvas.height = 5;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx) {
      gameViewService.setCanvas(ctx);
      gameViewService.onArenaResponse(expectedResponse);
      expect(spy).toHaveBeenCalled();
    }
  }));

  it("should play html audio fail sound when called", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const audio1: HTMLAudioElement = document.createElement("audio");
    const audio2: HTMLAudioElement = document.createElement("audio");
    const successSound: ElementRef = new ElementRef<HTMLAudioElement>(audio1);
    const failsound:    ElementRef = new ElementRef<HTMLAudioElement>(audio2);
    gameViewService.setSounds(successSound, failsound, mock(ElementRef), mock(ElementRef), mock(ElementRef));
    const spy: any = spyOn(gameViewService["failSound"].nativeElement, "play");
    gameViewService.playFailSound();
    expect(spy).toHaveBeenCalled();
  }));

  it("should play html audio win sound when called", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const audio1: HTMLAudioElement = document.createElement("audio");
    const winSound: ElementRef = new ElementRef<HTMLAudioElement>(audio1);
    gameViewService.setSounds(mock(ElementRef), mock(ElementRef), mock(ElementRef), winSound, mock(ElementRef));
    const spy: any = spyOn(gameViewService["winSound"].nativeElement, "play");
    gameViewService.playWinSound();
    expect(spy).toHaveBeenCalled();
  }));

  it("should play html audio loss sound when called", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const audio1: HTMLAudioElement = document.createElement("audio");
    const lossSound: ElementRef = new ElementRef<HTMLAudioElement>(audio1);
    gameViewService.setSounds(mock(ElementRef), mock(ElementRef), mock(ElementRef), mock(ElementRef), lossSound);
    const spy: any = spyOn(gameViewService["lossSound"].nativeElement, "play");
    gameViewService.playLossSound();
    expect(spy).toHaveBeenCalled();
  }));

  it("should play html audio opponent sound when called", inject([GameViewSimpleService], (gameViewService: GameViewSimpleService) => {
    const audio1: HTMLAudioElement = document.createElement("audio");
    const opponentSound: ElementRef = new ElementRef<HTMLAudioElement>(audio1);
    gameViewService.setSounds(mock(ElementRef), mock(ElementRef), opponentSound, mock(ElementRef), mock(ElementRef));
    const spy: any = spyOn(gameViewService["opponentSound"].nativeElement, "play");
    gameViewService["playOpponentSound"]();
    expect(spy).toHaveBeenCalled();
  }));

});
