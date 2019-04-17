import Str from 'core/str';
import ModalFactory from 'core/modal_factory';
import ModalEvents from 'core/modal_events';
import Fragment from 'core/fragment';
import Notification from 'core/notification';
import Y from 'core/yui';

// Some of the code was taken from
//   https://docs.moodle.org/dev/MForm_Modal

export class MFormModal {

    constructor(form, modalTitle, contextid, moreargs) {
        this.form = form;
        this.modalTitle = modalTitle;
        this.contextid = contextid;
        this.moreargs = moreargs;

        this.modal = null;
        this.formSubmittedSuccess = false;

        this.messageAfterSubmit = null;
        this.messageAfterSubmitDisplayed = false;

        this.isSubmitting = false;

        this.finished = new Promise((resolve, reject) => {
            // Promise should return True if form was submitted successfully and false if
            // form/modal was closed without submit.
           this._finishedResolve = resolve;
           this._finishedReject = reject;
        });
    }

    async show() {
        this.modal = await ModalFactory.create({
            type: ModalFactory.types.SAVE_CANCEL,
            title: this.modalTitle,
            body: this.getBody()
        });

        // Forms are big, we want a big modal.
        this.modal.setLarge();

        // We want to reset the form every time it is opened.
        this.modal.getRoot().on(ModalEvents.hidden, this.destroy.bind(this));

        // We want to hide the submit buttons every time it is opened.
        this.modal.getRoot().on(ModalEvents.shown, function() {
            this.modal.getRoot().append('<style>[data-fieldtype=submit] { display: none ! important; }</style>');
            // Set save button text (call here because event bodyRendered is not fired when the modal is displayed for the first time).
            this.saveButtonText();
        }.bind(this));

        // We catch the modal save event, and use it to submit the form inside the modal.
        // Triggering a form submission will give JS validation scripts a chance to check for errors.
        this.modal.getRoot().on(ModalEvents.save, this.submitForm.bind(this));
        // We also catch the form submit event and use it to submit the form with ajax.
        this.modal.getRoot().on('submit', 'form', this.submitFormAjax.bind(this));

        // Set save button text.
        this.modal.getRoot().on(ModalEvents.bodyRendered, this.saveButtonText.bind(this));

        this.modal.show();
    }

    getBody(formdata) {
        if (typeof formdata === "undefined") {
            formdata = {};
        }
        // Get the content of the modal.
        const params = {
            jsonformdata: JSON.stringify(formdata),
            form: this.form,
            moreargs: JSON.stringify(this.moreargs),
        };

        return Fragment.loadFragment('mod_vuejsdemo', 'mform', this.contextid, params);
    }

    saveButtonText() {
        // Find the submit button in the form and adjust the modal's save button text.

        let tries = 3;

        let findTextAndSet = () => {
            if (tries <= 0) {
                // We did not found the button. Give up.
                return;
            }
            let button = this.modal.getRoot().find('input[name=submitbutton]');
            if (button.length === 1 && button.attr('value')) {
                this.modal.setSaveButtonText(button.attr('value'));
            } else {
                // Button not found. Try again later.
                tries -= 1;
                setTimeout(findTextAndSet, 100);
            }
        };

        // We have to wait here a moment because the browser has to render the html first.
        setTimeout(findTextAndSet, 2);
    }

    submitFormAjax(e) {
        // We don't want to do a real form submission.
        e.preventDefault();

        if (this.isSubmitting) {
            // We are already submitting and waiting for the result. Do not allow to send again before
            // finishing the other request.
            return;
        }

        this.isSubmitting = true;

        // Convert all the form elements values to a serialised string.
        const formData = this.modal.getRoot().find('form').serialize();

        let promiseBody = this.getBody(formData);
        promiseBody.then((html, js) => {
            this.isSubmitting = false;
            if (html.startsWith('ok')) {
                this.formSubmittedSuccess = true;
                if (html.length > 3) {
                    this.messageAfterSubmit = html.substr(3);
                }
                this.destroy();

            } else {
                this.modal.setBody(promiseBody);
            }
        });
        promiseBody.fail((e) => {
            Notification.exception(e);
            this.isSubmitting = false;
        });
    }

    /**
     * This triggers a form submission, so that any mform elements can do final tricks before the form submission is processed.
     *
     * @method submitForm
     * @param {Event} e Form submission event.
     * @private
     */
    submitForm(e) {
        e.preventDefault();
        this.modal.getRoot().find('form').submit();
    }

    destroy(graceful = true) {
        // Trigger event through promise.
        if (graceful) {
            this._finishedResolve(this.formSubmittedSuccess);
        } else {
            this._finishedReject();
        }

        this.modal.hide();
        Y.use('moodle-core-formchangechecker', function() {
            M.core_formchangechecker.reset_form_dirty_state();
        });
        this.modal.destroy();

        if (graceful) {
            this.displayMessageAfterSubmit();
        }
    }

    displayMessageAfterSubmit() {
        if (this.messageAfterSubmit && !this.messageAfterSubmitDisplayed) {
            this.messageAfterSubmitDisplayed = true;
            let modalPromise = ModalFactory.create({
                type: ModalFactory.types.DEFAULT,
                title: this.modalTitle,
                body: this.messageAfterSubmit,
            });
            modalPromise.then((modal) => {
                modal.show();
            });
        }
    }
}
