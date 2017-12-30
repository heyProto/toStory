import React from 'react';
import ReactDOM from 'react-dom';
import EditArticleCard from './src/js/EditContainer.jsx';

ProtoGraph.Card.toStory.prototype.getData = function (data) {
  return this.containerInstance.exportData();
}

ProtoGraph.Card.toStory.prototype.renderSEO = function (data) {
  this.renderMode = 'SEO';
  return this.containerInstance.renderSEO();
}

ProtoGraph.Card.toStory.prototype.renderEdit = function (onPublishCallback) {
  this.mode = 'edit';
  this.onPublishCallback = onPublishCallback;
  ReactDOM.render(
    <EditArticleCard
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      optionalConfigURL={this.options.configuration_url}
      optionalConfigSchemaURL={this.options.configuration_schema_url}
      onPublishCallback={this.onPublishCallback}
      houseColors={this.options.houseColors}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}