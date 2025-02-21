import { expect } from "chai";
import { BMPBuilder } from "../utilities/bmpBuilder";
import { ClusterCounter } from "../utilities/clusterCounter";

// tslint:disable:no-magic-numbers
const WHITE:    number = 255;
const BLACK:    number = 0;

describe("Cluster Counter tests", () => {

    it("should count one clusters in a grid", (done: Function) => {
        const width:    number = 4;
        const height:   number = 4;

        const newBuilder: BMPBuilder = new BMPBuilder(width, height, WHITE);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 2, 2);

        const bufferWIthDiff:    Buffer         = Buffer.from(newBuilder.buffer);
        const clusterCounter:    ClusterCounter = new ClusterCounter(bufferWIthDiff, width);
        const numberOfDiffFound: number         = clusterCounter.countAllClusters();

        expect(numberOfDiffFound).equal(1);
        done();
    });

    it("should count all the distinct clusters in grid and find 2 differences", (done: Function) => {
        const width:    number = 4;
        const height:   number = 4;

        const newBuilder: BMPBuilder = new BMPBuilder(width, height, WHITE);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 3);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 3, 0);

        const bufferWIthDiff:    Buffer         = Buffer.from(newBuilder.buffer);
        const clusterCounter:    ClusterCounter = new ClusterCounter(bufferWIthDiff, width);
        const numberOfDiffFound: number         = clusterCounter.countAllClusters();

        expect(numberOfDiffFound).equal(2);
        done();
    });

    it("should count all the distinct clusters in grid and find 1 difference", (done: Function) => {
        const width:    number = 4;
        const height:   number = 4;

        const newBuilder: BMPBuilder = new BMPBuilder(width, height, WHITE);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 3);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 2);

        const bufferWIthDiff:    Buffer         = Buffer.from(newBuilder.buffer);
        const clusterCounter:    ClusterCounter = new ClusterCounter(bufferWIthDiff, width);
        const numberOfDiffFound: number         = clusterCounter.countAllClusters();

        expect(numberOfDiffFound).equal(1);
        done();
    });

    it("should count touching clusters (diagonal) as one", (done: Function) => {
        const width:    number = 4;
        const height:   number = 4;

        const newBuilder: BMPBuilder = new BMPBuilder(width, height, WHITE);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 0);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 1, 1);

        const bufferWIthDiff:    Buffer         = Buffer.from(newBuilder.buffer);
        const clusterCounter:    ClusterCounter = new ClusterCounter(bufferWIthDiff, width);
        const numberOfDiffFound: number         = clusterCounter.countAllClusters();

        expect(numberOfDiffFound).equal(1);
        done();
    });

    it("should count clusters in a horizontal array", (done: Function) => {
        const HEIGHT:   number = 1;
        const WIDTH:    number = 8;

        const newBuilder: BMPBuilder = new BMPBuilder(WIDTH, HEIGHT, WHITE);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 0);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 1, 0);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 4, 0);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 5, 0);

        const bufferWIthDiff:    Buffer         = Buffer.from(newBuilder.buffer);
        const clusterCounter:    ClusterCounter = new ClusterCounter(bufferWIthDiff, WIDTH);
        const numberOfDiffFound: number         = clusterCounter.countAllClusters();

        expect(numberOfDiffFound).to.equal(2);
        done();
    });

    it("should count clusters in a vertical array", (done: Function) => {

        const HEIGHT:   number = 8;
        const WIDTH:    number = 1;

        const newBuilder: BMPBuilder = new BMPBuilder(WIDTH, HEIGHT, WHITE);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 1);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 2);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 4);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 5);

        const bufferWIthDiff:    Buffer         = Buffer.from(newBuilder.buffer);
        const clusterCounter:    ClusterCounter = new ClusterCounter(bufferWIthDiff, WIDTH);
        const numberOfDiffFound: number         = clusterCounter.countAllClusters();

        expect(numberOfDiffFound).to.equal(2);
        done();
    });

    it("should count clusters in an single cell array with a difference", (done: Function) => {
        const width:    number = 1;
        const height:   number = 1;

        const newBuilder: BMPBuilder = new BMPBuilder(width, height, WHITE);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 0);

        const bufferWIthDiff:    Buffer         = Buffer.from(newBuilder.buffer);
        const clusterCounter:    ClusterCounter = new ClusterCounter(bufferWIthDiff, width);
        const numberOfDiffFound: number         = clusterCounter.countAllClusters();

        expect(numberOfDiffFound).equal(1);
        done();
    });

    it("should count no clusters in an empty buffer", (done: Function) => {
        const diffList:         Buffer          = Buffer.alloc(0);
        const WIDTH:            number          = 0;
        const clusterCounter:   ClusterCounter  = new ClusterCounter(diffList, WIDTH);
        const count:            number          = clusterCounter.countAllClusters();

        expect(count).to.equal(0);
        done();
    });

    it("should handle a given width bigger than the given buffer lenght ", (done: Function) => {
        const newBuilder: BMPBuilder = new BMPBuilder(1, 1, WHITE);
        newBuilder.setColorAtPos(BLACK, BLACK, BLACK, 0, 0);

        const WIDTH:            number          = 10;
        const bufferWIthDiff:   Buffer          = Buffer.from(newBuilder.buffer);
        const clusterCounter:   ClusterCounter  = new ClusterCounter(bufferWIthDiff, WIDTH);
        const count:            number          = clusterCounter.countAllClusters();

        expect(count).to.equal(1);
        done();
    });
});
