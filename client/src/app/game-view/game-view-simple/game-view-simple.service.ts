import { ElementRef, Injectable } from "@angular/core";
import { IClickMessage, IPlayerInputResponse, IPosition2D } from "../../../../../common/communication/iGameplay";
import { CCommon } from "../../../../../common/constantes/cCommon";

const DELAY: number = 1000;

@Injectable({
  providedIn: "root",
})

export class GameViewSimpleService {

  public canvasOriginal:  CanvasRenderingContext2D;
  public canvasModified:  CanvasRenderingContext2D;
  public successSound:    ElementRef;
  public failSound:       ElementRef;
  private position:       IPosition2D;

  public onArenaResponse(data: IPlayerInputResponse): void {
    if (data.status === CCommon.ON_SUCCESS) {
      this.playSuccessSound();
      data.response.cluster.forEach((pixel) => {
        this.canvasModified.fillStyle = "rgb(" + pixel.color.R + ", " + pixel.color.G + ", " + pixel.color.B + ")";
        this.canvasModified.fillRect(pixel.position.x, pixel.position.y, 1, 1);
      });
    } else {
      this.playFailSound();
      const canvasBack: HTMLCanvasElement = document.createElement("canvas");
      canvasBack.width = this.canvasOriginal.canvas.width;
      canvasBack.height = this.canvasOriginal.canvas.height;
      const canvasBackctx: CanvasRenderingContext2D | null = canvasBack.getContext("2d");
      if (canvasBackctx !== null) {
        canvasBackctx.drawImage(this.canvasOriginal.canvas, 0, 0);
      }
      this.disableClickRoutine(canvasBack);
    }
  }

  private enableClickRoutine(): void {
      document.body.style.cursor = "auto";
      this.canvasModified.canvas.style.pointerEvents = "auto";
      this.canvasOriginal.canvas.style.pointerEvents = "auto";
    }

  private disableClickRoutine(): void {
      document.body.style.cursor = "not-allowed";
      this.canvasModified.canvas.style.pointerEvents = "none";
      this.canvasOriginal.canvas.style.pointerEvents = "none";
      window.setTimeout(() => this.enableClickRoutine() , DELAY);
}

  public playFailSound(): void {
    this.failSound.nativeElement.currentTime = 0;
    this.failSound.nativeElement.play();
  }

  public playSuccessSound(): void {
    this.successSound.nativeElement.currentTime = 0;
    this.successSound.nativeElement.play();
  }

  public setCanvas(modified: CanvasRenderingContext2D, original: CanvasRenderingContext2D): void {
    this.canvasModified = modified;
    this.canvasOriginal = original;
  }

  public setSounds(success: ElementRef, fail: ElementRef): void {
    this.successSound = success;
    this.failSound    = fail;
  }

  public onCanvasClick(pos: IPosition2D, id: number, username: string): IClickMessage {
    return {
      position:     pos,
      arenaID:      id,
      username:     username,
    };
  }
}
