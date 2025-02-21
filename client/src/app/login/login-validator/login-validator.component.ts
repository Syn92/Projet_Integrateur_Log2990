import { Component, Inject } from "@angular/core";
import {FormControl, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import { ErrorStateMatcher, MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from "@angular/material";
import { Router } from "@angular/router";
import { PictureChangerDialogComponent } from "src/app/picture-changer-dialog/picture-changer-dialog.component";
import { Message } from "../../../../../common/communication/message";
import { CCommon } from "../../../../../common/constantes/cCommon";
import { CClient } from "../../CClient";
import { SocketService } from "../../websocket/socket.service";
import { LoginValidatorService } from "../login-validator.service";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted: boolean | null = form && form.submitted;

    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector:     "app-login-validator",
  templateUrl:  "./login-validator.component.html",
  styleUrls:    ["./login-validator.component.css"],
})
export class LoginValidatorComponent {

  public readonly LOGO_URL: string = CClient.PATH_TO_IMAGES + "/logo.png";
  public readonly HINT_USERNAME:  string = "Nom d'utilisateur";
  public readonly HINT:           string = "Veuillez entrer un alias";
  public readonly ERROR_PATTERN:  string = "Caractères autorisés: A-Z, a-z, 0-9";
  public readonly ERROR_SIZE:     string = "Taille: " + CCommon.MIN_NAME_LENGTH + "-" + CCommon.MAX_NAME_LENGTH + " caractères";
  public readonly ERROR_REQUIRED: string = "Nom d'utilisateur requis";
  public readonly BUTTON_SUBMIT:  string = "Soumettre";

  public matcher: MyErrorStateMatcher;

  public constructor(
  @Inject(LoginValidatorService)  public  loginValidatorService:  LoginValidatorService,
  @Inject(SocketService)          private socketService:          SocketService,
  public  dialog:   MatDialog,
  private snackbar: MatSnackBar,
  private router:   Router,
  ) {
    this.matcher = new MyErrorStateMatcher();
  }

  public usernameFormControl: FormControl = new FormControl("", [
    Validators.required,
    Validators.pattern(CCommon.REGEX_PATTERN_ALPHANUM),
    Validators.minLength(CCommon.MIN_NAME_LENGTH),
    Validators.maxLength(CCommon.MAX_NAME_LENGTH),
  ]);

  public addUsername(): void {
    if (this.usernameFormControl.errors === null) {
      this.loginValidatorService.addUsername(this.usernameFormControl.value).subscribe((response: Message) => {

        if (response.title === CCommon.ON_ERROR) {
          this.displaySnackBar(response.body, CClient.SNACK_ACTION);

          return;
        }

        if (response.body === CCommon.IS_UNIQUE) {
          const nameCapitalized: string = this.loginValidatorService.capitalizeFirstLetter(this.usernameFormControl.value);
          sessionStorage.setItem(CClient.USERNAME_KEY, nameCapitalized);
          this.socketService.sendMessage(CCommon.LOGIN_EVENT, nameCapitalized);
          this.generatePicture();
        } else {
          this.displayNameNotUnique();
        }
      });
    }
  }

  private generatePicture(): void {
    const dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus    = true;
    dialogConfig.height       = "800px";
    dialogConfig.width        = "500px";
    dialogConfig.panelClass   = "full-blend-dalog";
    dialogConfig.autoFocus    = true;
    dialogConfig.disableClose = true;
    const dialogRef: MatDialogRef<PictureChangerDialogComponent> = this.dialog.open(PictureChangerDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( async () => {
      this.displayNameIsUnique();
      await this.router.navigate([CClient.ROUTER_LOGIN]);
    });
  }

  private displaySnackBar(message: string, closeStatement: string): void {
      this.snackbar.open(
        message,
        closeStatement,
        { duration: CClient.SNACKBAR_DURATION});
  }

  private displayNameIsUnique(): void {
    this.displaySnackBar(
      CClient.SNACKBAR_GREETINGS + this.usernameFormControl.value,
      CClient.SNACKBAR_ACKNOWLEDGE);
  }

  private displayNameNotUnique(): void {
    this.displaySnackBar(
      this.usernameFormControl.value + CClient.SNACKBAR_USED_NAME,
      CClient.SNACKBAR_ATTENTION);
  }
}
