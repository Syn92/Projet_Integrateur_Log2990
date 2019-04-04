import * as THREE from "three";
import { IPosition2D } from "../../../../../../../common/communication/iGameplay";

export class ThreejsMovement {

    private readonly CAMERA_MOVEMENT_SPEED:   number = 2;
    private readonly CAMERA_ROTATION_SPEED:   number = 0.01;
    private readonly CAMERA_COLLISION_RADIUS: number = 5;

    private camera:     THREE.PerspectiveCamera;
    private velocity:   THREE.Vector3;
    private direction:  THREE.Vector3;
    private pointingAt: THREE.Vector3;
    private front:      THREE.Vector3;
    private orthogonal: THREE.Vector3;
    private objettttt:  THREE.Mesh;

    public constructor(camera: THREE.PerspectiveCamera, private scene: THREE.Scene) {
        this.camera     = camera;
        this.velocity   = new THREE.Vector3(0, 0, 0);
        this.direction  = new THREE.Vector3(0, 0, 0);
        this.front      = new THREE.Vector3(0, 0, 0);
        this.orthogonal = new THREE.Vector3(0, 0, 0);
        this.pointingAt = new THREE.Vector3(0, 0, 0);

        const geometry: THREE.SphereGeometry = new THREE.SphereGeometry( 0.1 );
        const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        this.objettttt = new THREE.Mesh( geometry, material );
        scene.add( this.objettttt );
    }

    public setupFront(orientation: number): void {
        this.camera.getWorldDirection(this.front);
        this.front.normalize();
        this.multiplyVector(this.front, orientation);
    }

    public rotateCamera(position: IPosition2D): void {
        const yAxis: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
        const xAxis: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
        this.camera.rotateOnWorldAxis(yAxis, -position.x * this.CAMERA_ROTATION_SPEED);
        this.camera.rotateOnAxis(xAxis, -position.y * this.CAMERA_ROTATION_SPEED);
    }

    public movementCamera(moveForward: boolean, moveBackward: boolean, moveLeft: boolean, moveRight: boolean): void {

        if ( moveLeft ) {
          this.moveToSide(1);

        } else if ( moveRight ) {
          this.moveToSide(-1);
        }

        this.addVectors(this.front, this.orthogonal, this.direction);
        this.direction.normalize();

        if ( moveForward || moveBackward || moveLeft || moveRight) {

            this.direction.z = Number(moveBackward) - Number(moveForward);
            this.direction.x = Number(moveRight)    - Number(moveLeft);
            this.setCameratVelocity();
        } else {
            this.multiplyVector(this.velocity, 0);
        }
        if (!this.detectCollisionInDirection(this.direction)) {
            this.translateCamera();
        }
    }

    private moveToSide(orientation: number): void {
        const frontvector:  THREE.Vector3 = new THREE.Vector3(0, 0, 0);
        const yAxis:        THREE.Vector3 = new THREE.Vector3(0, orientation, 0);
        this.camera.getWorldDirection(frontvector);
        this.crossProduct(frontvector, yAxis, this.orthogonal);
    }

    private setCameratVelocity(): void {
        this.direction.normalize();
        this.updatePointAt();
        this.bougeMaBoule();
        this.velocity.x = this.direction.x * this.CAMERA_MOVEMENT_SPEED;
        this.velocity.y = this.direction.y * this.CAMERA_MOVEMENT_SPEED;
        this.velocity.z = this.direction.z * this.CAMERA_MOVEMENT_SPEED;
    }

    private updatePointAt(): void {
        const front: THREE.Vector3 = this.getFront();
        const right: THREE.Vector3 = this.getRight();

        front.z *= this.direction.z;
        right.x *= this.direction.x;

        this.addVectors(front, right, this.pointingAt);

        this.pointingAt.normalize();
    }

    private getFront(): THREE.Vector3 {
        const front: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
        this.camera.getWorldDirection(front);

        return front.normalize();
    }

    private getRight(): THREE.Vector3 {
        const yAxis: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
        const right: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

        this.crossProduct(this.getFront(), yAxis, right);

        return right.normalize();
    }

    private bougeMaBoule(): void {
        this.objettttt.position.x = this.camera.position.x + (this.pointingAt.x * (this.CAMERA_COLLISION_RADIUS + 1));
        this.objettttt.position.y = this.camera.position.y + (this.pointingAt.y * (this.CAMERA_COLLISION_RADIUS + 1));
        this.objettttt.position.z = this.camera.position.z + (this.pointingAt.z * (this.CAMERA_COLLISION_RADIUS + 1));
    }

    private detectCollisionInDirection(direction: THREE.Vector3): boolean {
        const worldPosition: THREE.Vector3 = new THREE.Vector3();
        this.camera.getWorldPosition(worldPosition);
        const raycaster: THREE.Raycaster = new THREE.Raycaster(worldPosition, direction, 0, this.CAMERA_COLLISION_RADIUS);

        const objectsIntersected: THREE.Intersection[] = raycaster.intersectObjects(this.scene.children, true);

        return objectsIntersected.length > 0;
    }

    // private objectIsBlockingDirection(frontDirection: number): boolean {
    //     const raycaster:      THREE.Raycaster = new THREE.Raycaster();
    //     const worldDirection: THREE.Vector3   = new THREE.Vector3();

    //     this.camera.getWorldDirection(worldDirection);

    //     const ray: THREE.Vector3 =
    //         new THREE.Vector3(worldDirection.x, worldDirection.y, worldDirection.z * - frontDirection);
    //     raycaster.set(this.camera.position, ray);

    //     const objectsIntersected: THREE.Intersection[] = raycaster.intersectObjects(this.scene.children, true);

    //     return objectsIntersected.length > 0 && objectsIntersected[0].distance < this.CAMERA_COLLISION_RADIUS;
    // }

    private translateCamera(): void {
        this.camera.translateX(this.velocity.x);
        this.camera.translateY(this.velocity.y);
        this.camera.translateZ(this.velocity.z);
    }

    private multiplyVector (vector: THREE.Vector3, multiplier: number): void {
        vector.x *= multiplier;
        vector.y *= multiplier;
        vector.z *= multiplier;
    }

    private addVectors (vector1: THREE.Vector3, vector2: THREE.Vector3, toVector: THREE.Vector3): void {
        toVector = new THREE.Vector3(0, 0, 0);
        toVector.x = vector1.x + vector2.x;
        toVector.y = vector1.y + vector2.y;
        toVector.z = vector1.z + vector2.z;
    }

    private crossProduct (vector1: THREE.Vector3, vector2: THREE.Vector3, toVector: THREE.Vector3): void {
        toVector = new THREE.Vector3(0, 0, 0);
        toVector.x = (vector1.y * vector2.z) - (vector1.z * vector2.y);
        toVector.y = (vector1.x * vector2.z) - (vector1.z * vector2.x);
        toVector.z = (vector1.x * vector2.y) - (vector1.y * vector2.x);
    }
}
