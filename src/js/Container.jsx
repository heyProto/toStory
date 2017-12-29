import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ta from 'time-ago';
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
    if(this.props.houseColors){
      stateVar.optionalConfigJSON.house_color = this.props.houseColors.house_color;
      stateVar.optionalConfigJSON.inverse_house_color = this.props.houseColors.inverse_house_color;
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
      am_pm = "am"
    } else {
      am_pm = "pm"
    }

    return {
      month: month,
      am_pm: am_pm,
      date: date_split_by_hyphen,
      time: time
    }
  }

  renderSixteenCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      console.log(this.state);
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      console.log(genreColor);
      return(
        <div className="proto-col col-16">
          <div className="col-16-story-card">
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:430}} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
            <div className="bottom-pull-div">
              <div className="card-tags">
                <div class="publisher-icon"></div>
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-light">Sponsored</div> : null
                }
              </div>
              <div className="article-title">
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line">
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  renderSevenCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      return(
        <div className="proto-col col-7">
          <div className="col-7-story-card">
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:250}} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
            <div className="card-tags">
                <div class="publisher-icon"></div>
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-dark">Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title">
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line">
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  renderFourCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      return(
        <div className="proto-col col-4">
          <div className="col-4-story-card">
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:250}} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
            <div className="card-tags">
                <div class="publisher-icon"></div>
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-dark">Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title">
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line">
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  renderThreeCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      return(
        <div className="proto-col col-3">
          <div className="col-3-story-card">
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:250}} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
            <div className="card-tags">
                <div class="publisher-icon"></div>
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-dark">Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title">
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line">
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  renderTwoCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      return(
        <div className="proto-col col-2">
          <div className="col-2-story-card">
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:250}} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
            <div className="card-tags">
                <div class="publisher-icon"></div>
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-dark">Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title">
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line">
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  render() {
    switch(this.props.mode) {
      case '16_col':
        return this.renderSixteenCol();
      case '7_col':
        return this.renderSevenCol();
      case '4_col':
        return this.renderFourCol();
      case '3_col':
        return this.renderThreeCol();
      case '2_col':
        return this.renderTwoCol();
    }
  }
}