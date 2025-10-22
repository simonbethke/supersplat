import { Button, Container, NumericInput } from '@playcanvas/pcui';
import { EventHandler, TranslateGizmo, Vec3 } from 'playcanvas';

import { BoxShape } from '../box-shape';
import { Events } from '../events';
import { Scene } from '../scene';
import { Splat } from '../splat';
import { Tool } from './tool-manager';

const EVENT_GROUP = 'BoxSelection';

class BoxSelection implements Tool {
    private events: Events;
    private scene: Scene;
    private canvasContainer: Container;
    private parts!: {
        gizmo: TranslateGizmo,
        box: BoxShape,
        selectToolbar: Container
    };

    constructor(events: Events, scene: Scene, canvasContainer: Container) {
        this.events = events;
        this.scene = scene;
        this.canvasContainer = canvasContainer;
        this.initParts();

        this.events.onGroup(EVENT_GROUP, 'camera.focalPointPicked', (details: { splat: Splat, position: Vec3 }) => {
            this.parts.box.pivot.setPosition(details.position);
            this.parts.gizmo.attach([this.parts.box.pivot]);
        });

        this.events.onGroup(EVENT_GROUP, ['camera.resize', 'camera.ortho'], () => this.updateGizmoSize());
    }

    activate() {
        this.scene.add(this.parts.box);
        this.parts.gizmo.attach([this.parts.box.pivot]);
        this.parts.selectToolbar.hidden = false;
        this.events.activateGroup(EVENT_GROUP);
        this.updateGizmoSize();
    }

    deactivate() {
        this.events.deactivateGroup(EVENT_GROUP);
        this.parts.selectToolbar.hidden = true;
        this.parts.gizmo.detach();
        this.scene.remove(this.parts.box);
    }


    apply(box: BoxShape, op: 'set' | 'add' | 'remove') {
        const p = box.pivot.getPosition();
        this.events.fire('select.byBox', op, [p.x, p.y, p.z, box.lenX, box.lenY, box.lenZ]);
    }

    initParts() {
        const box = new BoxShape();

        const gizmo = new TranslateGizmo(this.scene.camera.entity.camera, this.scene.gizmoLayer);

        gizmo.on('render:update', () => {
            this.scene.forceRender = true;
        });

        gizmo.on('transform:move', () => {
            box.moved();
        });

        // ui
        const selectToolbar = new Container({
            class: 'select-toolbar',
            hidden: true
        });

        selectToolbar.dom.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
        });

        const setButton = new Button({ text: 'Set', class: 'select-toolbar-button' });
        const addButton = new Button({ text: 'Add', class: 'select-toolbar-button' });
        const removeButton = new Button({ text: 'Remove', class: 'select-toolbar-button' });

        const lenX = new NumericInput({
            precision: 2,
            value: box.lenX,
            placeholder: 'LenX',
            width: 80,
            min: 0.01
        });

        const lenY = new NumericInput({
            precision: 2,
            value: box.lenY,
            placeholder: 'LenY',
            width: 80,
            min: 0.01
        });

        const lenZ = new NumericInput({
            precision: 2,
            value: box.lenZ,
            placeholder: 'LenZ',
            width: 80,
            min: 0.01
        });

        selectToolbar.append(setButton);
        selectToolbar.append(addButton);
        selectToolbar.append(removeButton);
        selectToolbar.append(lenX);
        selectToolbar.append(lenY);
        selectToolbar.append(lenZ);

        this.canvasContainer.append(selectToolbar);

        setButton.dom.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            this.apply(box, 'set');
        });
        addButton.dom.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            this.apply(box, 'add');
        });
        removeButton.dom.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            this.apply(box, 'remove');
        });
        lenX.on('change', () => {
            box.lenX = lenX.value;
        });
        lenY.on('change', () => {
            box.lenY = lenY.value;
        });
        lenZ.on('change', () => {
            box.lenZ = lenZ.value;
        });

        this.parts = {
            gizmo,
            box,
            selectToolbar
        };
    }

    updateGizmoSize() {
        const { camera, canvas } = this.scene;
        if (camera.ortho) {
            this.parts.gizmo.size = 1125 / canvas.clientHeight;
        } else {
            this.parts.gizmo.size = 1200 / Math.max(canvas.clientWidth, canvas.clientHeight);
        }
    }
}

export { BoxSelection };
