import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MatDialogRef, MatSnackBar } from "@angular/material";
import { LoginValidatorService } from "../login/login-validator.service";
import { FileValidatorService } from "./file-validator.service";

const SNACK_DURATION: number = 2000;
const ERROR_MSG: string = "Veuillez entrer un fichier BMP";
const ACTION: string = "OK";

@Component({
  selector: "app-create-simple-game",
  templateUrl: "./create-simple-game.component.html",
  styleUrls: ["./create-simple-game.component.css"],
})
export class CreateSimpleGameComponent implements OnInit {

  public _title: string = "Créer un jeu de point de vue simple";
  public _originalImage: string = "Image originale";
  public _modifiedImage: string = "Image modifiée";
  public _submit: string = "Soumettre";
  public _cancel: string = "Annuler";
  public _maxlength: number = 15;
  public _isImageBMP: boolean[] = [false, false];
  public _originalIndex: number = 0;
  public _modifiedIndex: number = 1;

  private _selectedFiles: Blob[] = [];

  public constructor(
    public dialogRef: MatDialogRef<CreateSimpleGameComponent>,
    public fileValidatorService: FileValidatorService,
    private snackBar: MatSnackBar,
    public _loginValidatorService: LoginValidatorService,
    ) {/* default constructor */}

  public ngOnInit(): void {
    // default init
  }

  public hasFormControlErrors(): boolean {
    return !( this._loginValidatorService.usernameFormControl.errors == null &&
              this._isImageBMP[this._originalIndex] && this._isImageBMP[this._modifiedIndex]);
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public onFileSelected(file: Blob, imageIndex: number): void {
    if (this.fileValidatorService.validateFile(file)) {
      this._selectedFiles.push(file);
      this._isImageBMP[imageIndex] = true;
    } else {
      this._isImageBMP[imageIndex] = false;
      this.snackBar.open(ERROR_MSG, ACTION, {
        duration: SNACK_DURATION,
      });
    }
  }

  public submit(data: NgForm): void {
    this.dialogRef.close(JSON.stringify(data.value));
  }
}
