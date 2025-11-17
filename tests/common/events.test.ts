import {test, expect, describe, beforeEach} from "bun:test";
import EventEmitter from "@common/events";
import Logger from "@common/logger";

describe("EventEmitter", () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe("constructor", () => {
        test("should initialize with empty events object", () => {
            expect(emitter.events).toEqual({});
        });
    });

    describe("on", () => {
        test("should add event listener", () => {
            const callback = () => {};
            emitter.on("test", callback);
            expect(emitter.events.test.has(callback)).toBe(true);
        });

        test("should create new Set for first listener", () => {
            const callback = () => {};
            emitter.on("test", callback);
            expect(emitter.events.test).toBeInstanceOf(Set);
            expect(emitter.events.test.size).toBe(1);
        });

        test("should add multiple listeners for same event", () => {
            const callback1 = () => {};
            const callback2 = () => {};
            emitter.on("test", callback1);
            emitter.on("test", callback2);
            expect(emitter.events.test.size).toBe(2);
            expect(emitter.events.test.has(callback1)).toBe(true);
            expect(emitter.events.test.has(callback2)).toBe(true);
        });
    });

    describe("emit", () => {
        test("should call all listeners for an event", () => {
            let called1 = false;
            let called2 = false;
            emitter.on("test", () => {called1 = true;});
            emitter.on("test", () => {called2 = true;});

            emitter.emit("test");
            expect(called1).toBe(true);
            expect(called2).toBe(true);
        });

        test("should pass arguments to listeners", () => {
            let receivedArgs: any[] = [];
            emitter.on("test", (...args) => {receivedArgs = args;});

            emitter.emit("test", "arg1", 2, {key: "value"});
            expect(receivedArgs).toEqual(["arg1", 2, {key: "value"}]);
        });

        test("should do nothing for non-existent event", () => {
            expect(() => emitter.emit("nonexistent")).not.toThrow();
        });

        test("should continue executing other listeners if one throws", () => {
            const error = new Error("Test error");
            let secondListenerCalled = false;

            // Mock Logger.error to prevent console output during test
            const originalError = Logger.error;
            Logger.error = () => {};

            emitter.on("test", () => {throw error;});
            emitter.on("test", () => {secondListenerCalled = true;});

            emitter.emit("test");
            expect(secondListenerCalled).toBe(true);

            // Restore Logger.error
            Logger.error = originalError;
        });

        test("should log error when listener throws", () => {
            const error = new Error("Test error");
            let errorLogged = false;

            // Mock Logger.error to check if it's called
            const originalError = Logger.error;
            Logger.error = () => {errorLogged = true;};

            emitter.on("test", () => {throw error;});
            emitter.emit("test");
            expect(errorLogged).toBe(true);

            // Restore Logger.error
            Logger.error = originalError;
        });
    });

    describe("off", () => {
        test("should remove specific listener", () => {
            const callback = () => {};
            emitter.on("test", callback);
            emitter.off("test", callback);
            expect(emitter.events.test.has(callback)).toBe(false);
        });

        test("should return true when listener is removed", () => {
            const callback = () => {};
            emitter.on("test", callback);
            expect(emitter.off("test", callback)).toBe(true);
        });

        test("should return undefined for non-existent event", () => {
            const callback = () => {};
            expect(emitter.off("nonexistent", callback)).toBeUndefined();
        });

        test("should return false when listener not found", () => {
            const callback1 = () => {};
            const callback2 = () => {};
            emitter.on("test", callback1);
            expect(emitter.off("test", callback2)).toBe(false);
        });

        test("should not affect other listeners", () => {
            const callback1 = () => {};
            const callback2 = () => {};
            emitter.on("test", callback1);
            emitter.on("test", callback2);
            emitter.off("test", callback1);
            expect(emitter.events.test.has(callback2)).toBe(true);
            expect(emitter.events.test.size).toBe(1);
        });
    });

    describe("setMaxListeners", () => {
        test("should exist but do nothing", () => {
            expect(() => emitter.setMaxListeners()).not.toThrow();
        });
    });

    describe("EventEmitter getter", () => {
        test("should return EventEmitter class", () => {
            expect(EventEmitter.EventEmitter).toBe(EventEmitter);
        });
    });
});
