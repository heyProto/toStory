import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

export default class ToArticleCard extends React.Component {
  constructor(props) {
    super(props)
    let stateVar = {
      fetchingData: true,
      dataJSON: {
        card_data: {},
        configs: {}
      },
      schemaJSON: undefined,
      optionalConfigJSON: {},
      optionalConfigSchemaJSON: undefined
    };
    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
    }

    if (this.props.schemaJSON) {
      stateVar.schemaJSON = this.props.schemaJSON;
    }

    if (this.props.optionalConfigJSON) {
      stateVar.optionalConfigJSON = this.props.optionalConfigJSON;
    }

    if (this.props.optionalConfigSchemaJSON) {
      stateVar.optionalConfigSchemaJSON = this.props.optionalConfigSchemaJSON;
    }

    this.state = stateVar;
  }

  componentDidMount() {
    if (this.state.fetchingData){
      axios.all([axios.get(this.props.dataURL), axios.get(this.props.schemaURL), axios.get(this.props.optionalConfigURL), axios.get(this.props.optionalConfigSchemaURL)])
        .then(axios.spread((card, schema, opt_config, opt_config_schema) => {
          this.setState({
            fetchingData: false,
            dataJSON: {
              card_data: card.data,
              configs: opt_config.data
            },
            schemaJSON: schema.data,
            optionalConfigJSON: opt_config.data,
            optionalConfigSchemaJSON: opt_config_schema.data
          });
        }));
    } 
  }


  exportData() {
    return document.querySelector('#protograph-div').getBoundingClientRect();
  }

  calculateDateTime() {
    const data = this.state.dataJSON.card_data;
    let date_split, date_split_by_hyphen, new_date, month, time;
      date_split = data.data.date.split("T")[0],
      date_split_by_hyphen = date_split.split("-"),
      new_date = new Date(date_split),
      month = new_date.toLocaleString("en-us", { month: "short" }),
      time = data.data.date.split("T")[1];
    let is_am_pm_split = time.split(":"), am_pm;
    if (is_am_pm_split[0] < "12"){
      am_pm = "a.m."
    } else {
      am_pm = "p.m."
    }

    return {
      month: month,
      am_pm: am_pm,
      date: date_split_by_hyphen,
      time: time
    }
  }

  renderSmallImgTxtLayout() {
    if (this.state.schemaJSON === undefined){
      return(<div>Loading</div>)
    } else {
      const data = this.state.dataJSON.card_data;
      let date = this.calculateDateTime();
      return (
        <a href={data.data.url} target="_blank" className="protograph-url">
          <div id="protograph-div" className="col-sm-16">
            <div className="proto-card tolink-card">
              <div className="title-small-img-text-layout">
                <div className="card-title">{data.data.title}</div>
                <div className="by-time-line">
                  {data.data.author !=='' || data.data.hasOwnProperty("author") ? <div className="by-line">{data.data.author}</div> : ''}
                  <div className="time-ago">{date.month} {date.date[2]}, {date.date[0]} {date.time} {date.am_pm}</div>
                </div>
                <div className="card-img col-sm-7"><img src={data.data.thumbnail_url} width="100%"/></div>
                <div className="card-text col-sm-9">{data.data.description}</div>
             </div>
            </div>
          </div>
        </a>
      )
    }
  }

  renderTitleTextLayout() {
    if (this.state.schemaJSON === undefined){
      return(<div>Loading</div>)
    } else {
      const data = this.state.dataJSON.card_data;
      let date = this.calculateDateTime();
      return (
        <a href={data.data.url} target="_blank" className="protograph-url">
          <div id="protograph-div" className="col-sm-16">
            <div className="proto-card tolink-card">
              <div className="title-text-layout">
                <div className="card-title">{data.data.title}</div>
                <div className="by-time-line">
                  {data.data.author !=='' || data.data.hasOwnProperty("author") ? <div className="by-line">{data.data.author}</div> : ''}
                  <div className="time-ago">{date.month} {date.date[2]}, {date.date[0]} {date.time} {date.am_pm}</div>
                </div>
                <div className="card-text">{data.data.description}</div>
              </div>
            </div>
          </div>
        </a>
      )
    }
  }

  renderTitleThumbnailLayout(){
    if (this.state.schemaJSON === undefined){
      return(<div>Loading</div>)
    } else {
      const data = this.state.dataJSON.card_data;
      let date = this.calculateDateTime();
      return (
        <a href={data.data.url} target="_blank" className="protograph-url">
          <div id="protograph-div" className="col-sm-16">
            <div className="proto-card tolink-card">
              <div className="title-thumbnail-layout">
                <div className="col-sm-12 no-padding-col">
                  <div className="card-title">{data.data.title}</div>
                  <div className="by-time-line">
                    {data.data.author !=='' || data.data.hasOwnProperty("author") ? <div className="by-line">{data.data.author}</div> : ''}
                    <div className="time-ago">{date.month} {date.date[2]}, {date.date[0]} {date.time} {date.am_pm}</div>
                  </div>
                </div>
                <div className="col-sm-4 no-padding-col">
                  <div className="card-img"><img src={data.data.thumbnail_url} width="100%"/></div>
                </div>
              </div>
            </div>
          </div>
        </a>
      )
    }
  }

  renderBigImgTxtLayout() {
    if (this.state.schemaJSON === undefined){
      return(<div>Loading</div>)
    } else {
      const data = this.state.dataJSON.card_data;
      let date = this.calculateDateTime();
      return(
        <a href={data.data.url} target="_blank" className="protograph-url">
          <div id="protograph-div" className="col-sm-16">
            <div className="proto-card tolink-card">
              <div className="title-big-img-text-layout">
                <div className="card-img"><img src={data.data.thumbnail_url}  width="100%"/></div>
                <div className="card-title">{data.data.title}</div>
                <div className="by-time-line">
                  {data.data.author !=='' || data.data.hasOwnProperty("author") ? <div className="by-line">{data.data.author}</div> : ''}
                  <div className="time-ago">{date.month} {date.date[2]}, {date.date[0]} {date.time} {date.am_pm}</div>
                </div>
                <div className="card-text">{data.data.description}</div>
              </div>
            </div>
          </div>
        </a>
      )
    }
  }

  renderFeatureImage(){
    if (this.state.schemaJSON === undefined){
      return(<div>Loading</div>)
    } else {
      const data = this.state.dataJSON.card_data;
      return (
        <a href={data.data.url} target="_blank" className="protograph-url">
          <div id="protograph-div" className="col-sm-16">
            <div className="proto-card tolink-card">
              <div className="feature-story-layout">
                <div className="col-sm-16 no-padding-col feature-area">
                  <div className="feature-bg-image"><img src={data.data.feature_image_url} width="100%"/></div>
                  <div className="gradient-layer">
                    <div className="feature-title">{data.data.title}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      )
    }
  }

  renderScreenshot() {
    if (this.state.schemaJSON === undefined){
      return(<div>Loading</div>)
    } else {
      const data = this.state.dataJSON.card_data;
      let date = this.calculateDateTime();
      return (
        <div id="ProtoScreenshot" className="col-sm-16" style={styles}>
          <div className="proto-card tolink-card">
            <div className="title-small-img-text-layout">
              <div className="card-title">{data.data.title}</div>
              <div className="by-time-line">
                {data.data.author !=='' || data.data.hasOwnProperty("author") ? <div className="by-line">{data.data.author}</div> : ''}
                <div className="time-ago">{date.month} {date.date[2]}, {date.date[0]} {date.time} {date.am_pm}</div>
              </div>
              <div className="card-img col-sm-7"><img src={data.data.thumbnail_url} width="100%"/></div>
              <div className="card-text col-sm-9">{data.data.description}</div>
           </div>
          </div>
        </div>
      )
    }
  }

  render() {
    switch(this.props.mode) {
      case 'small_image_text':
        return this.renderSmallImgTxtLayout();
      case 'title_text':
        return this.renderTitleTextLayout();
      case 'thumbnail':
        return this.renderTitleThumbnailLayout();
      case 'feature_image':
        return this.renderFeatureImage();
      case 'big_image_text':
        return this.renderBigImgTxtLayout();
      case 'screenshot':
        return this.renderScreenshot();
    }
  }
}