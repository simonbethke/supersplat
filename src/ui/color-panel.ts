import { Container, ContainerArgs, Label, NumericInput, Panel, PanelArgs, VectorInput } from 'pcui';
import { Quat, Vec3 } from 'playcanvas';
import { Events } from '../events';
import { Splat } from '../splat';
import { EntityColorOp, EntityTransformOp } from '../edit-ops';
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
            min: -0.5,
            max: 0.5,
            enabled: false
        });

        tint.append(tintLabel);
        tint.append(tintInput);



        this.append(temperature);
        this.append(tint);

        let selection: Splat | null = null;

        const toArray = (v: Vec3) => {
            return [v.x, v.y, v.z];
        };

        const toVec3 = (a: number[]) => {
            return new Vec3(a[0], a[1], a[2]);
        };

        let uiUpdating = false;

        const updateUI = () => {
            uiUpdating = true;
            temperatureInput.value = selection.colorTemperature;
            tintInput.value = selection.colorTint;
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
            const p = selection.pivot.getLocalPosition();
            const r = selection.pivot.getLocalRotation();
            const s = selection.pivot.getLocalScale();

            op = new EntityColorOp({
                splat: selection,
                oldAdj: {
                    temp: selection.colorTemperature,
                    tint: selection.colorTemperature
                },
                newAdj: {
                    temp: selection.colorTemperature,
                    tint: selection.colorTemperature
                }
            });
        };

        const updateOp = () => {
            op.newAdj.temp = temperatureInput.value;
            op.newAdj.tint = tintInput.value;

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
