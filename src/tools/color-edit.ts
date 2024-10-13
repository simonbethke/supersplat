import { Container, NumericInput } from 'pcui';
import { Events } from '../events';
import { Scene } from '../scene';

class ColorEdit {
    activate: () => void;
    deactivate: () => void;

    active = false;

    private adjustments = {
        red: 1.0,
        green: 1.0,
        blue: 1.0
    };

    private events: Events;

    constructor(events: Events, scene: Scene, canvasContainer: Container) {

        // ui
        const selectToolbar = new Container({
            id: 'select-toolbar',
            hidden: true
        });

        selectToolbar.dom.addEventListener('pointerdown', (e) => { e.stopPropagation(); });

        const colorRed = new NumericInput({
            precision: 2,
            value: this.adjustments.red,
            placeholder: 'Red',
            width: 80,
            min: 0.01
        });

        const colorGreen = new NumericInput({
            precision: 2,
            value: this.adjustments.green,
            placeholder: 'Green',
            width: 80,
            min: 0.01
        });

        const colorBlue = new NumericInput({
            precision: 2,
            value: this.adjustments.blue,
            placeholder: 'Blue',
            width: 80,
            min: 0.01
        });

        selectToolbar.append(colorRed);
        selectToolbar.append(colorGreen);
        selectToolbar.append(colorBlue);

        canvasContainer.append(selectToolbar);

        colorRed.on('change', () => this.adjustColors('red', colorRed.value));
        colorGreen.on('change', () => this.adjustColors('green', colorGreen.value));
        colorBlue.on('change', () => this.adjustColors('blue', colorBlue.value));


        this.activate = () => {
            this.active = true;
            selectToolbar.hidden = false;
        };

        this.deactivate = () => {
            selectToolbar.hidden = true;
            this.active = false;
        };

        this.events = events;
    }

    adjustColors(band: 'red'|'green'|'blue', value: number) {
        this.events.fire(
            'color.update',
            band,
            value / this.adjustments[band]
        ); 
        this.adjustments[band] = value;  
    }
}

export { ColorEdit };
