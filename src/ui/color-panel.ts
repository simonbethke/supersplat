import { Container, ContainerArgs, Label, NumericInput } from 'pcui';
import { Events } from '../events';
import { Splat } from '../splat';
import { EntityColorOp } from '../edit-ops';
import { localize } from './localization';

class ColorPanel extends Container {
    constructor(events: Events, args: ContainerArgs = {}) {
        args = {
            ...args,
            id: 'color-panel'
        };

        super(args);

        const temperature = new Container({
            class: 'color-row'
        });

        const temperatureLabel = new Label({
            class: 'color-label',
            text: localize('color.temperature')
        });

        const temperatureInput = new NumericInput({
            class: 'color-expand',
            precision: 2,
            value: 0,
            min: -0.5,
            max: 0.5,
            enabled: false
        });

        temperature.append(temperatureLabel);
        temperature.append(temperatureInput);

        
        
        const tint = new Container({
            class: 'color-row'
        });

        const tintLabel = new Label({
            class: 'color-label',
            text: localize('color.tint')
        });

        const tintInput = new NumericInput({
            class: 'color-expand',
            precision: 2,
            value: 0,
            max: 0.5,
            min: -0.5,
            enabled: false
        });

        tint.append(tintLabel);
        tint.append(tintInput);



        this.append(temperature);
        this.append(tint);

        let selection: Splat | null = null;

        let uiUpdating = false;

        const updateUI = () => {
            uiUpdating = true;
            temperatureInput.value = selection.colorAdjustments.temp;
            tintInput.value = selection.colorAdjustments.tint;
            uiUpdating = false;
        };

        events.on('selection.changed', (splat) => {
            selection = splat;

            if (selection) {
                // enable inputs
                updateUI();
                temperatureInput.enabled = tintInput.enabled = true;
            } else {
                // disable inputs
                temperatureInput.enabled = tintInput.enabled = false;
            }
        });

        let op: EntityColorOp | null = null;
 
        const createOp = () => {
            op = new EntityColorOp({
                splat: selection,
                oldAdj: selection.colorAdjustments,
                newAdj: selection.colorAdjustments
            });
        };

        const updateOp = () => {
            op.newAdj = {
                temp: temperatureInput.value,
                tint: tintInput.value
            };

            op.do();
        };

        const submitOp = () => {
            events.fire('edit.add', op);
            op = null;
        };

        const change = () => {
            if (!uiUpdating) {
                if (op) {
                    updateOp();
                } else {
                    createOp();
                    updateOp();
                    submitOp();
                }
            }
        };

        const mousedown = () => {
            createOp();
        };

        const mouseup = () => {
            updateOp();
            submitOp();
        };

        [temperatureInput, tintInput].forEach((input) => {
            input.on('change', change);
            input.on('slider:mousedown', mousedown);
            input.on('slider:mouseup', mouseup);
        });
    }
}

export { ColorPanel };
