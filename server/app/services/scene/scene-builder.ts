import { IAxisValues, ISceneObject, SceneObjectType } from "../../../../common/communication/iSceneObject";
import { ISceneOptions } from "../../../../common/communication/iSceneOptions";
import { ISceneVariables } from "../../../../common/communication/iSceneVariables";
import { SceneConstants } from "./sceneConstants";
import { CollisionValidator } from "./utilitaries/collision-validator";

export class SceneBuilder {

    private sceneVariables: ISceneVariables<ISceneObject>;
    private collisionValidator: CollisionValidator;

    public constructor () {

        this.collisionValidator = new CollisionValidator();
    }

    public generateScene(sceneOptions: ISceneOptions): ISceneVariables<ISceneObject> {

        this.sceneVariables = {
            theme: sceneOptions.sceneType,
            gameName: sceneOptions.sceneName,
            sceneObjectsQuantity: sceneOptions.sceneObjectsQuantity,
            sceneObjects: [],
            sceneBackgroundColor: this.generateRandomBackgroundColor(),
        };

        return this.generateSceneObjects(sceneOptions);
    }

    public generateRandomAxisValues(): IAxisValues {
        const randomX: number = this.randomIntegerFromInterval(0, SceneConstants.MAX_POSITION_X);
        const randomY: number = this.randomIntegerFromInterval(0, SceneConstants.MAX_POSITION_Y);
        const randomZ: number = this.randomIntegerFromInterval(0, SceneConstants.MAX_POSITION_Z);

        return {
            x: randomX,
            y: randomY,
            z: randomZ,
        };
    }

    public generateRandomRotationValues(): IAxisValues {
        const randomRadX: number = this.randomFloatFromInterval(0, SceneConstants.TWO_PI);
        const randomRadY: number = this.randomFloatFromInterval(0, SceneConstants.TWO_PI);
        const randomRadZ: number = this.randomFloatFromInterval(0, SceneConstants.TWO_PI);

        return {
            x: randomRadX,
            y: randomRadY,
            z: randomRadZ,
        };
    }

    public generateRandomScaleValues(): IAxisValues {
        const randomX: number = this.randomIntegerFromInterval(SceneConstants.MIN_SCALE, SceneConstants.MAX_SCALE);
        const randomY: number = this.randomIntegerFromInterval(SceneConstants.MIN_SCALE, SceneConstants.MAX_SCALE);
        const randomZ: number = this.randomIntegerFromInterval(SceneConstants.MIN_SCALE, SceneConstants.MAX_SCALE);

        return {
            x: randomX,
            y: randomY,
            z: randomZ,
        };
    }

    public generateRandomBackgroundColor(): string {
        const red:      number = this.randomIntegerFromInterval(
                                    SceneConstants.MIN_BACKGROUND_COLOR_GRADIENT,
                                    SceneConstants.MAX_COLOR_GRADIENT,
                                );
        const green:    number = this.randomIntegerFromInterval(
                                    SceneConstants.MIN_BACKGROUND_COLOR_GRADIENT,
                                    SceneConstants.MAX_COLOR_GRADIENT,
                                );
        const blue:     number = this.randomIntegerFromInterval(
                                    SceneConstants.MIN_BACKGROUND_COLOR_GRADIENT,
                                    SceneConstants.MAX_COLOR_GRADIENT,
                                );

        return this.rgbToHex(red, green, blue);
    }

    public generateRandomColor(): string {
        const red:      number = this.randomIntegerFromInterval(SceneConstants.MIN_COLOR_GRADIENT, SceneConstants.MAX_COLOR_GRADIENT);
        const green:    number = this.randomIntegerFromInterval(SceneConstants.MIN_COLOR_GRADIENT, SceneConstants.MAX_COLOR_GRADIENT);
        const blue:     number = this.randomIntegerFromInterval(SceneConstants.MIN_COLOR_GRADIENT, SceneConstants.MAX_COLOR_GRADIENT);

        return this.rgbToHex(red, green, blue);
    }

    private forceTwoDigitsColor(hex: string): string {

        return (hex.length < SceneConstants.LENGTH_OF_TWO) ? "0" + hex : hex;
   }

    private rgbToHex(r: number, g: number, b: number): string {

       let red: string = r.toString( SceneConstants.HEX_TYPE );
       red = this.forceTwoDigitsColor(red);

       let green: string = g.toString( SceneConstants.HEX_TYPE );
       green = this.forceTwoDigitsColor(green);

       let blue: string = b.toString( SceneConstants.HEX_TYPE );
       blue = this.forceTwoDigitsColor(blue);

       return SceneConstants.HEX_PREFIX + red + green + blue;
   }

    public randomIntegerFromInterval(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public randomFloatFromInterval(min: number, max: number): number {
        return Math.random() * (max - min + 1) + min;
    }

    private generateSceneObjects(sceneOptions: ISceneOptions): ISceneVariables<ISceneObject> {

        const sceneObjectsQuantity: number = sceneOptions.sceneObjectsQuantity;

        for (let index: number = 0; index < sceneObjectsQuantity; index++) {
            const generatedObject: ISceneObject = this.generateRandomSceneObject(index);
            this.sceneVariables.sceneObjects.push(generatedObject);
        }

        return this.sceneVariables;
    }

    public generateRandomSceneObject(index: number): ISceneObject {

        const newSceneObject: ISceneObject = this.createRandomSceneObject(index);

        this.validatePosition(newSceneObject);

        return newSceneObject;
    }

    private selectRandomType(): SceneObjectType {

        return this.randomIntegerFromInterval(0, SceneConstants.MAX_TYPE_INDEX);
    }

    private validatePosition(newSceneObject: ISceneObject): void {

        let hasCollision: boolean;

        do {

            newSceneObject.position = this.generateRandomAxisValues();
            hasCollision = this.collisionValidator.hasCollidingPositions(newSceneObject, this.sceneVariables.sceneObjects);
        } while (hasCollision);
    }

    public generateModifyObject(index: number, iSceneVariables: ISceneVariables<ISceneObject>): ISceneObject {

        this.sceneVariables = iSceneVariables;

        const newSceneObject: ISceneObject = this.createRandomSceneObject(index);

        this.validatePosition(newSceneObject);

        return newSceneObject;
    }

    private createRandomSceneObject(index: number): ISceneObject {

        return {
            id:         index,
            type:       this.selectRandomType(),
            position:   this.generateRandomAxisValues(),
            rotation:   this.generateRandomRotationValues(),
            scale:      this.generateRandomScaleValues(),
            color:      this.generateRandomColor(),
            hidden:     false,
        };
    }
}
