


//% color=#700264 icon="\uf2f2"
//% groups='[]'
namespace stopwatch {

    export enum TimerType {
        //% block="seconds.mil"
        Sec,
        //% block="min:sec:mil"
        Minsec
    }


    //Formerly in pxt-common-packages/libs/core/timer.ts

    /**
    * A timer
    */
    //% fixedInstances
    export class Timer {
        start: number;
        timerKind: TimerType;

        constructor() {
            this.start = game.runtime();
            this.timerKind = TimerType.Minsec;
        }

        /**
         * Gets the elapsed time in millis since the last reset
         */
        millis(): number {
            return game.runtime() - this.start;
        }

        /**
         * Gets the elapsed time in seconds since the last reset
         */
        seconds(): number {
            return Math.round(this.millis() / 1000);
        }

        /**
         * Resets the timer
         */
        reset() {
            this.start = game.runtime();
        }

    }

    //Formerly in shakao/pxt-countup

    /**
     * Pauses action until the timer reaches the given amount of milliseconds
     * @param ms how long to pause for, eg: 5, 100, 200, 500, 1000, 2000
     */
    //% blockId=timerPauseUntil 
    //% block="pause until timer reaches $thisSec (seconds)"
    //% ms.defl=5
    export function pauseUntil(thisSec: number) {
        const remaining = stopwatch.timer1.millis() - (thisSec*1000);
        pause(Math.max(0, remaining));
    }

    /**
    * Pauses timer 
    */
    // blockId=timerPause block="pause timer" weight=5
    export function pauseCountup() {

    }

    // Formerly in Carnival ---

    let timerState: TimerState = undefined;
    let hudElement: scene.Renderable;

    class TimerState {
        public playerStates: info.PlayerState[];
        public visibilityFlag: number;

        public bgColor: number;
        public borderColor: number;
        public fontColor: number;

        constructor() {
            this.visibilityFlag = info.Visibility.Hud;
            this.bgColor = screen.isMono ? 0 : 1;
            this.borderColor = screen.isMono ? 1 : 3;
            this.fontColor = screen.isMono ? 1 : 3;
        }
    }


    let timerStateStack: {
        state: TimerState,
        scene: scene.Scene
    }[];


    /**
     * Adds timer to game
     */
    //% blockId=start_count_up_game
    //% block="start timer || using $timerKind"
    //% inlineInputMode=inline
    //% timerKind.defl=TimerType.Minsec
    //% help=github:docs/start_count_up_game
    export function startTimer(timerKind?: TimerType) {
        if (timerKind != undefined) { stopwatch.timer1.timerKind = timerKind}
        stopwatch.timer1.reset();
        updateFlag(info.Visibility.Countdown, true);
        timerHUD();
    }

    /**
     * Set whether timer should be displayed
     * @param on if true, countdown is shown; otherwise, countdown is hidden
     */
    //% blockId=show_timer
    //% block="show timer $on"
    //% inlineInputMode=inline
    //% on.shadow=toggleOnOff
    //% on.defl=true
    //% help=github:docs/show_timer
    export function showTimer(on: boolean) {
        updateFlag(info.Visibility.Countdown, on);
    }

    /**
     * Return the current value of the count-up timer
     */
    //% blockId=get_timer
    //% block="timer value (ms)"
    //% inlineInputMode=inline
    //% help=github:docs/get_timer
    export function getTimerValue(): number {
        return stopwatch.timer1.millis();
    }

    /**
    * Return the current value of the count-up timer
    */
    //% blockId=get_timer_seconds
    //% block="timer value (seconds)"
    //% inlineInputMode=inline
    //% help=github:docs/get_timer_seconds
    export function timeSinceStartSec(): number {
        return Math.round(stopwatch.timer1.millis() / 1000);
    }

    /**
    * Changes timer by number of milliseconds
    */
    //% blockId=change_timer
    //% block="add $mils (ms) to timer"
    //% inlineInputMode=inline
    //% help=github:docs/change_timer
    export function changeTimerBy(mils:number){
        let currentTimer = stopwatch.timer1.millis()+mils;
        stopwatch.timer1.start= game.runtime() - currentTimer
    }

    /**
    * Toggles the flag to indicate timer visibility
    */
    function updateFlag(flag: info.Visibility, on: boolean) {
        timerHUD();
        if (on) timerState.visibilityFlag |= flag;
        else timerState.visibilityFlag = ~(~timerState.visibilityFlag | flag);
    }

    /**
    * Draws current timer on the screen
    * in proper format
    */
    function drawTimer(millis: number) {
        if (millis < 0) millis = 0;
        millis |= 0;

        const font = image.font8;
        const smallFont = image.font5;
        const seconds = Math.idiv(millis, 1000);
        let manySecs = seconds.toString().length
        let color1 = timerState.fontColor;
        let color2 = timerState.bgColor;

        if (stopwatch.timer1.timerKind == TimerType.Minsec){

            const top = 1;
            const remainder = Math.idiv(millis % 1000, 10);
            const minutes = Math.idiv(seconds, 60);
            const hrs = Math.idiv(seconds, 3600);
            const remainder1 = seconds % 60;
            let manyMins = minutes.toString().length
            let prefix = formatDecimal(minutes) + ":"

            if(hrs>0){
                manyMins = hrs.toString().length + 4
                prefix = formatDecimal(hrs) + ":" + formatDecimal(minutes%60) + ":"
            }

            const width = font.charWidth * (7 + manyMins) + 2;
            let left = (screen.width >> 1) - (width >> 1) + 1;
            screen.fillRect(left - 3, 0, width + 6, font.charHeight + 3, timerState.borderColor)
            screen.fillRect(left - 2, 0, width + 4, font.charHeight + 2, color2)
            screen.print(prefix + formatDecimal(remainder1) + ":" + formatDecimal(remainder), left+manyMins, 1, color1, font);
       
        } else{
            const top = 1;
            const remainder = Math.idiv(millis % 1000, 10); 
            const width = font.charWidth * (manySecs + 4);
            let left = (screen.width >> 1) - (width >> 1);

            const decimalLeft = left + 3 * font.charWidth;


            screen.fillRect(left - 3, 0, width + 6, font.charHeight + 3, timerState.borderColor)
            screen.fillRect(left - 2, 0, width + 4, font.charHeight + 2, color2)
            screen.print(formatDecimal(seconds) + "." + formatDecimal(remainder), left+manySecs-1, top, color1, font)
        }

    }

    /**
    * Formats number with leading 0 when necessary
    */
    function formatDecimal(val: number) {
        val |= 0;
        if (val < 10) {
            return "0" + val;
        }
        return val.toString();
    }

    /**
    * Initiates timer HUD on screen when flag set
    */
    function timerHUD() {
        if (timerState) return;

        timerState = new TimerState();

        hudElement=scene.createRenderable(
            scene.HUD_Z,
            () => {

                // show timer
                if (timerState.visibilityFlag & info.Visibility.Countdown) {
                //if (countUpInitialized) {

                    const scene = game.currentScene();
                    //const elapsed = scene.millis();
                    const elapsed = stopwatch.timer1.millis();
                    drawTimer(elapsed);
                    let t = elapsed / 1000;
                    if (t <= 0) {
                        t = 0;
                    }
                }
            }
        );
    }


    /**
    * Removes timer
    */
    //% blockId=gameclearcountup block="clear timer" weight=5
    export function clearCountup() {
        if (hudElement) {
            hudElement.destroy();
            hudElement = undefined;
        }
    }

    /**
    * Creates a timer to work with in this extension
    */
    //% whenUsed fixedInstance block="timer 1"
    export const timer1 = new stopwatch.Timer();

}
