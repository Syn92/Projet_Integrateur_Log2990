import { HttpClient } from "@angular/common/http";
import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnChanges,
  Output,
  ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { GameConnectionService } from "src/app/game-connection.service";
import * as THREE from "three";
import { IClickMessage, IPosition2D, ISceneObjectUpdate } from "../../../../../../common/communication/iGameplay";
import { ISceneMessage } from "../../../../../../common/communication/iSceneMessage";
import { ISceneData, ISceneVariables } from "../../../../../../common/communication/iSceneVariables";
import { Message } from "../../../../../../common/communication/message";
import { CCommon } from "../../../../../../common/constantes/cCommon";
import { CardManagerService } from "../../../card/card-manager.service";
import { Constants } from "../../../constants";
import { SocketService } from "../../../websocket/socket.service";
import { ChatViewService } from "../../chat-view/chat-view.service";
import { GameViewFreeService } from "../game-view-free.service";
import { ThreejsViewService } from "./threejs-view.service";

enum KEYS {
  w     = "w",
  a     = "a",
  s     = "s",
  d     = "d",
  t     = "t",
}

@Component({
  selector:     "app-threejs-view",
  templateUrl:  "./threejs-view.component.html",
  styleUrls:    ["./threejs-view.component.css"],
  providers:    [ThreejsViewService],
})
export class TheejsViewComponent implements AfterContentInit, OnChanges {

  public scene:                         THREE.Scene;

  private readonly CHEAT_URL:           string = "cheat/";
  private readonly CHEAT_INTERVAL_TIME: number = 125;

  private renderer:               THREE.WebGLRenderer;
  private isCheating:             boolean;
  private interval:               NodeJS.Timeout;
  private focusChat:              boolean;
  private modifications:          number[];
  private previousModifications:  number[];
  private isFirstGet:             boolean;

  @Input() private rightClick:              boolean;
  @Input() private arenaID:                 number;
  @Input() private iSceneVariables:         ISceneVariables;
  @Input() private iSceneVariablesMessage:  ISceneData;
  @Input() private isSnapshotNeeded:        boolean;
  @Input() private isNotOriginal:           boolean;
  @Input() private username:                string;
  @Output() public sceneGenerated:          EventEmitter<string>;

  @ViewChild("originalScene", {read: ElementRef})
  private originalScene:          ElementRef;

  @HostListener("body:keyup", ["$event"])
  public async keyboardEventListenerUp(keyboardEvent: KeyboardEvent): Promise<void> {
    if (!this.focusChat) {
      this.onKeyUp(keyboardEvent);
    }
  }

  @HostListener("body:keydown", ["$event"])
  public async keyboardEventListenerDown(keyboardEvent: KeyboardEvent): Promise<void> {
    if (!this.focusChat) {
      this.handleKeyboardEvent(keyboardEvent);
    }
  }

  public constructor(
    @Inject(ThreejsViewService)   private threejsViewService:   ThreejsViewService,
    @Inject(ChatViewService)      private chatViewService:      ChatViewService,
    @Inject(SocketService)        private socketService:        SocketService,
    @Inject(GameViewFreeService)  private gameViewFreeService:  GameViewFreeService,
    private httpClient:         HttpClient,
    private snackBar:           MatSnackBar,
    private cardManagerService: CardManagerService,
    private gameConnectionService: GameConnectionService,
    ) {
    this.rightClick     = false;
    this.sceneGenerated = new EventEmitter();
    this.scene          = new THREE.Scene();
    this.isCheating     = false;
    this.focusChat      = false;
    this.isFirstGet     = true;
    this.initSubscriptions();
  }

  public onMouseMove(point: IPosition2D): void {
    if (this.rightClick) {
      this.threejsViewService.rotateCamera(point);
    }
  }

  public ngAfterContentInit(): void {
    this.initListener();
  }

  public ngOnChanges(): void {
    if (this.iSceneVariables !== undefined) {
      this.initScene();
    }
  }

  private initScene(): void {

    this.renderer = new THREE.WebGLRenderer();
    this.originalScene.nativeElement.appendChild(this.renderer.domElement);
    this.threejsViewService.createScene(this.scene, this.iSceneVariables, this.renderer, this.isSnapshotNeeded, this.arenaID);
    this.threejsViewService.animate();
    this.takeSnapShot();
  }

  private handleKeyboardEvent(keyboardEvent: KeyboardEvent): void {
    switch ( keyboardEvent.key ) {
      case KEYS.w:
        this.threejsViewService.setupFront(-1);
        this.threejsViewService.moveForward = true;
        break;

      case KEYS.a:
        this.threejsViewService.moveLeft = true;
        break;

      case KEYS.s:
        this.threejsViewService.setupFront(1);
        this.threejsViewService.moveBackward = true;
        break;

      case KEYS.d:
        this.threejsViewService.moveRight = true;
        break;

      case KEYS.t:
        this.cheatRoutine();
        break;

      default:
        break;
    }
  }

  private cheatRoutine (): void {
    this.httpClient.get(Constants.GET_OBJECTS_ID_PATH + this.CHEAT_URL + this.arenaID).subscribe((modifications: number[]) => {
      if (this.isFirstGet) {
        this.previousModifications = modifications;
        this.isFirstGet            = false;
      }

      this.modifications = modifications;
      this.isCheating    = !this.isCheating;
      this.changeColor();
    });
  }

  private onKeyUp(keyboardEvent: KeyboardEvent): void {
    switch ( keyboardEvent.key ) {
      case KEYS.w:
        this.threejsViewService.moveForward = false;
        break;
      case KEYS.a:
        this.threejsViewService.moveLeft = false;
        break;
      case KEYS.s:
        this.threejsViewService.moveBackward = false;
        break;
      case KEYS.d:
        this.threejsViewService.moveRight = false;
        break;

      default:
        break;
    }
  }

  private changeColor(): void {

    if (this.isCheating) {

      let flashValue: boolean = false;
      this.interval = setInterval(
        () => {
          flashValue = !flashValue;
          this.threejsViewService.changeObjectsColor(flashValue, false, this.modifications);
        },
        this.CHEAT_INTERVAL_TIME);
    } else {

      clearInterval(this.interval);
      this.threejsViewService.changeObjectsColor(false, true, this.previousModifications);
      this.previousModifications = this.modifications;
      this.modifications         = [];
    }
  }

  private getDifferencesList(): void {
    this.socketService.sendMsg(CCommon.ON_GET_MODIF_LIST, this.arenaID);
    this.socketService.onMsg(CCommon.ON_RECEIVE_MODIF_LIST).subscribe((list: number[]) => {
      this.modifications = list;
    });
  }

  private initSubscriptions(): void {
    this.gameViewFreeService.getRightClickListener().subscribe((newValue: boolean) => {
      this.rightClick = newValue;
    });

    this.chatViewService.getChatFocusListener().subscribe((newValue: boolean) => {
      this.focusChat = newValue;
    });

    this.gameConnectionService.getObjectToUpdate().subscribe((object: ISceneObjectUpdate) => {
      this.getDifferencesList();

      this.threejsViewService.changeObjectsColor(false, true, this.modifications);
      if (this.isNotOriginal) {
        this.threejsViewService.updateSceneWithNewObject(object);
      }
    });
  }

  private initListener(): void {
    this.originalScene.nativeElement.addEventListener("click", (mouseEvent: MouseEvent) => {

      const idValue: number                  = this.threejsViewService.detectObject(mouseEvent);
      const message: IClickMessage<number>   = this.createHitValidationMessage(idValue);

      this.socketService.sendMsg(CCommon.POSITION_VALIDATION, message);
    });
  }

  private takeSnapShot(): void {

    if (this.isSnapshotNeeded) {
      const snapshot: string        = this.renderer.domElement.toDataURL("image/jpeg");
      const message:  ISceneMessage = this.createMessage(snapshot);
      this.sendSnapshot(message);
    }
  }

  private createHitValidationMessage(id: number): IClickMessage<number> {
    return {
      value:    id,
      arenaID:  this.arenaID,
      username: this.username,
    };
  }

  private createMessage(image: string): ISceneMessage {
    return {
      iSceneVariablesMessage:   this.iSceneVariablesMessage,
      image:                    image,
    } as ISceneMessage;
  }

  private sendSnapshot(message: ISceneMessage): void {
    this.httpClient.post(Constants.FREE_SUBMIT_PATH, message).subscribe((response: Message) => {
      this.analyseResponse(response);
    });
  }

  private analyseResponse(response: Message): void {

    if (response.title === CCommon.ON_SUCCESS) {
      this.cardManagerService.updateCards(true);
      this.sceneGenerated.emit();
    } else if (response.title === CCommon.ON_ERROR) {
      this.openSnackBar(response.body, Constants.SNACK_ACTION);
    }
  }

  private openSnackBar(msg: string, action: string): void {
    this.snackBar.open(msg, action, {
      duration:           Constants.SNACKBAR_DURATION,
      verticalPosition:   "top",
    });
  }

}
