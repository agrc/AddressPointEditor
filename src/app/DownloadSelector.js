define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/event',

    'dojo/dom',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-attr',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/layout/StackContainer',
    'dijit/layout/ContentPane',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/text!app/templates/DownloadSelector.html',

    'app/data/counties',

    'esri/tasks/Geoprocessor'
], function(
    declare,
    lang,
    array,
    event,

    dom,
    on,
    aspect,
    domClass,
    domConstruct,
    domAttr,

    _WidgetBase,
    _TemplatedMixin,
    StackContainer,
    ContentPane,
    _WidgetsInTemplateMixin,

    template,

    counties,

    Geoprocessor
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        baseClass: 'download-selector',

        widgetsInTemplate: true,

        templateString: template,

        // the template page that is visible
        currentPage: 0,

        downloadFilter: null,

        jobId: null,

        _setDownloadUrlAttr: {
            node: 'downloadButton',
            type: 'attribute',
            attribute: 'href'
        },
        constructor: function() {
            console.info('app.downloadSelector::constructor', arguments);
        },
        postCreate: function() {
            // summary:
            //      dom is ready
            console.info('app.downloadSelector::postCreate', arguments);

            this.inherited(arguments);

            this.downloadFilter = {};

            this.pages = [this.cp1, this.cp2, this.cp3];

            this.hydrateCountySelect();

            this.sc.startup();

            this.initGp();
        },
        initGp: function() {
            // summary:
            //      description
            console.info('app.downloadSelector::initGp', arguments);

            this.gp = new Geoprocessor(AGRC.urls.downloadGp);
            //this.gp.on('onError', 'onJobError'),

            this.own(
                this.gp.on('job-complete', lang.hitch(this, 'gpComplete')),
                this.gp.on('status-update', lang.hitch(this, 'statusUpdate')),
                this.gp.on('get-result-data-complete', lang.hitch(this, 'displayLink')),
                this.gp.on('job-cancel', lang.hitch(this, 'jobCancelled'))
            );
        },
        showNextPage: function() {
            console.info('app.downloadSelector::showNextPage', arguments);

            if (this.currentPage < 0) {
                domClass.add(this.controlPanel, 'hidden');
                this.sc.selectChild(this.pages[0]);

                return;
            }

            if (this.currentPage < this.pages.length - 1) {
                this.currentPage++;
            }

            domClass.remove(this.controlPanel, 'hidden');

            this.sc.selectChild(this.pages[this.currentPage]);
        },
        back: function() {
            console.info('app.downloadSelector::back', arguments);

            if (this.currentPage > 0) {
                this.currentPage--;
            }

            if (this.currentPage === 0) {
                domClass.add(this.controlPanel, 'hidden');
            }

            this.sc.selectChild(this.pages[this.currentPage]);
        },
        setDownloadFilter: function(evt) {
            console.info('app.downloadSelector::setDownloadFilter', arguments);

            var node = evt.target,
                prop = node.getAttribute('data-prop'),
                value = null;

            value = node.getAttribute('data-' + prop);

            if (prop === 'county') {
                value = node.value;
            }

            this.downloadFilter[prop] = value.toLowerCase();
            this.showNextPage();

            this.showSubmitButton();
        },
        showSubmitButton: function() {
            console.info('app.downloadSelector::showSubmitButton', arguments);

            if (!this.valid()) {
                console.log('not valid');
                domClass.add(this.submitButton, 'hidden');
                domAttr.set(this.submitButton, 'disabled', true);

                return;
            }

            domClass.remove(this.submitButton, 'hidden');
            domAttr.set(this.submitButton, 'disabled', false);
        },
        hydrateCountySelect: function() {
            console.log('app.downloadSelector::hydrateCountySelect', arguments);

            var countyNames = counties.sort(
                function(a, b) {
                    a = a;
                    b = b;

                    if (a > b)
                        return 1;
                    if (a < b)
                        return -1;

                    return 0;
                });

            array.forEach(countyNames,
                function(v) {
                    domConstruct.create('option', {
                        value: v,
                        innerHTML: v.replace(/\w\S*/g, function(txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        })
                    }, this.countySelect);
                }, this);
        },
        validate: function(evt) {
            console.info('app.downloadSelector::validate', arguments);

            if (!this.valid()) {
                domClass.add(this.submitButton, 'hidden');
                domAttr.set(this.submitButton, 'disabled', true);

                event.stop(evt);
                return;
            }
        },
        valid: function() {
            // summary:
            //      validates the download object
            console.log('app.downloadSelector::valid', arguments);

            var props = ['system', 'type', 'county'];
            return array.every(props, function(item) {
                return !!this.downloadFilter[item];
            }, this);
        },
        submitJob: function() {
            // summary:
            //      sends the download filter to the gp service
            console.log('app.downloadSelector::submitJob', arguments);

            if (!this.valid()) {
                this.messagebox.innerHTML = "You haven't selected all the parts.";
                return;
            }

            this.messagebox.innerHTML = '';
            this.downloadButton.innerHTML = 'Submitting';
            this.gp.submitJob(this.downloadFilter);

            domClass.remove(this.cancelButton, 'hidden');
            domAttr.set(this.cancelButton, 'disabled', false);

            domClass.add(this.backButton, 'hidden');
            domAttr.set(this.backButton, 'disabled', true);

            domAttr.set(this.submitButton, 'disabled', true);
            domClass.add(this.submitButton, 'hidden');

            domAttr.set(this.downloadButton, 'disabled', null);
            domClass.remove(this.downloadButton, 'hidden');
        },
        cancelJob: function() {
            // summary:
            //      cancels the download job
            console.log('app.downloadSelector::cancelJob', arguments);

            this.gp.cancelJob(this.jobId);
        },
        jobCancelled: function() {
            // summary:
            //      successful cancel
            console.log('app.downloadSelector::jobCancelled', arguments);


        },
        statusUpdate: function(status) {
            // summary:
            //      status updates from the gp service
            // jobinfo: esri/tasks/JobInfo
            console.log('app.downloadSelector::statusUpdate', arguments);

            this.jobId = status.jobInfo.jobId;
            this.messagebox.innerHTML = '';

            switch (status.jobInfo.jobStatus) {
                case 'esriJobSubmitted':
                    this.downloadButton.innerHTML = 'Submitted';
                    break;
                case 'esriJobExecuting':
                    this.downloadButton.innerHTML = 'Processing';
                    break;
                case 'esriJobSucceeded':
                    this.downloadButton.innerHTML = 'Download';
                    break;
            }
        },
        gpComplete: function(status) {
            // summary:
            //      description
            // status: esri/tasks/JobInfo
            console.log('app.downloadSelector::gpComplete', arguments);

            switch (status.jobInfo.jobStatus) {
                case 'esriJobCancelling':
                case 'esriJobCancelled':
                    domClass.remove(this.backButton, 'hidden');
                    domAttr.set(this.backButton, 'disabled', false);

                    domClass.add(this.cancelButton, 'hidden');
                    domAttr.set(this.cancelButton, 'disabled', true);

                    domAttr.set(this.submitButton, 'disabled', false);
                    domClass.remove(this.submitButton, 'hidden');

                    domAttr.set(this.downloadButton, 'disabled', true);
                    domClass.add(this.downloadButton, 'hidden');
                    break;
                case 'esriJobSucceeded':
                    this.gp.getResultData(status.jobInfo.jobId, 'zip');
                    break;
                case 'esriJobFailed':
                    domClass.remove(this.backButton, 'hidden');
                    domAttr.set(this.backButton, 'disabled', false);

                    domClass.add(this.cancelButton, 'hidden');
                    domAttr.set(this.cancelButton, 'disabled', true);

                    domAttr.set(this.submitButton, 'disabled', false);
                    domClass.remove(this.submitButton, 'hidden');

                    domAttr.set(this.downloadButton, 'disabled', true);
                    domClass.add(this.downloadButton, 'hidden');

                    this.messagebox.innerHTML = "I'm sorry but the job failed.";

                    break;
            }

        },
        displayLink: function(response) {
            // summary:
            //      sets the download link's href
            // data: the esri/tasks/ParameterInfo object
            console.log('app.downloadSelector::displayLink', arguments);

            this.set('downloadUrl', response.result.value.url);

            domClass.remove(this.backButton, 'hidden');
            domAttr.set(this.backButton, 'disabled', false);

            domClass.add(this.cancelButton, 'hidden');
            domAttr.set(this.cancelButton, 'disabled', true);

            domAttr.set(this.submitButton, 'disabled', false);
            domClass.remove(this.submitButton, 'hidden');

            domAttr.remove(this.downloadButton, 'disabled');
        }
    });
});
