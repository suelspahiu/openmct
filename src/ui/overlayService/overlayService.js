/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2018, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

define([
    './overlay.vue',
    './blockingMessage.vue',
    'vue'
], function (
    OverlayComponent,
    BlockingMessage,
    Vue
) {

    function OverlayService() {
        this.activeOverlays = [];
        this.overlayId = 0;

        this.showBlockingMessage = this.showBlockingMessage.bind(this);
    }

    OverlayService.prototype.show  = function (element, options) {
        if(this.activeOverlays.length) {
            this.activeOverlays[this.activeOverlays.length - 1].overlay.classList.add('invisible');
        }

        let overlayTypeCssClass = options.cssClass, // Values could be l-large-view, l-dialog, l-message
            overlay = document.createElement('div'),
            component = new Vue({
                provide: {
                    destroy: this.destroy.bind(this),
                    element: element,
                    buttons: options.buttons
                },
                components: {
                    OverlayComponent: OverlayComponent.default
                },
                template: '<overlay-component></overlay-component>'
            }),
            dialog = {};


        overlay.classList.add('l-overlay-wrapper', overlayTypeCssClass);
        document.body.appendChild(overlay);

        overlay.appendChild(component.$mount().$el);

        var overlayObject = {
            overlay: overlay,
            component: component,
            onDestroy: options.onDestroy,
            id: this.overlayId,
            dialog: dialog
        };

        dialog.dismiss = function () {
            let pos = findInArray(overlayObject.id, this.activeOverlays);

            if (pos !== -1) {
                if (overlayObject.onDestroy && typeof overlayObject.onDestroy === 'function') {
                    overlayObject.onDestroy();
                }

                overlayObject.component.$destroy(true);
                document.body.removeChild(overlayObject.overlay);
                this.activeOverlays.splice(pos, 1);

                if (this.activeOverlays.length) {
                    this.activeOverlays[this.activeOverlays.length - 1].overlay.classList.remove('invisible');
                }
            }
        }.bind(this);

        this.activeOverlays.push(overlayObject);
        this.overlayId++;

        return dialog;
    };

    OverlayService.prototype.destroy = function () {
        var lastActiveOverlayObject = this.activeOverlays[this.activeOverlays.length - 1];

        lastActiveOverlayObject.dialog.dismiss(lastActiveOverlayObject.id);
    };

    OverlayService.prototype.showBlockingMessage = function (model) {
        let component = new Vue({
            provide: {
                model: model
            },
            components: {
                BlockingMessage: BlockingMessage.default
            },
            template: '<blocking-message></blocking-message>'
        });

        function destroy() {
            component.$destroy(true);
        }

        let options = {
            cssClass: 'l-message',
            onDestroy: destroy,
            buttons: model.buttons
        };

        return this.show(component.$mount().$el, options);
    };

    function findInArray(id, array) {
        var found = -1;

        array.forEach(function (o,i) {
            if (o.id === id) {
                found = i;
                return;
            }
        });

        return found;
    }

    return OverlayService;
});