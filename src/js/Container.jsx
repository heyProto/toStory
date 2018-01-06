import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ta from 'time-ago';
export default class toStoryCard extends React.Component {
  constructor(props) {
    super(props)
    let stateVar = {
      fetchingData: true,
      dataJSON: {
        card_data: {},
        configs: {}
      },
      schemaJSON: undefined,
      linkDetails: undefined,
      domain: undefined,
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
    if(this.props.linkDetails){
      stateVar.linkDetails = this.props.linkDetails;
    }
    if(this.props.domain){
      stateVar.domain = this.props.domain;
    }
    if(this.props.houseColors){
      stateVar.optionalConfigJSON.house_color = this.props.houseColors.house_color;
      stateVar.optionalConfigJSON.inverse_house_color = this.props.houseColors.inverse_house_color;
      stateVar.optionalConfigJSON.house_font_color = this.props.houseColors.house_font_color;
      stateVar.optionalConfigJSON.inverse_house_font_color = this.props.houseColors.inverse_house_font_color;
    }
    this.state = stateVar;
  }

  componentDidMount() {
    if (this.state.fetchingData){
      axios.all([axios.get(this.props.dataURL), axios.get(this.props.schemaURL), axios.get(this.props.optionalConfigURL), axios.get(this.props.optionalConfigSchemaURL), axios.get(window.ref_link_sources_url)])
        .then(axios.spread((card, schema, opt_config, opt_config_schema, links) => {
          this.setState({
            fetchingData: false,
            dataJSON: {
              card_data: card.data,
              configs: opt_config.data
            },
            linkDetails:links.data,
            schemaJSON: schema.data,
            optionalConfigJSON: opt_config.data,
            optionalConfigSchemaJSON: opt_config_schema.data
          });
        }));
    }
  }


  exportData() {
    return this.props.selector.getBoundingClientRect();
  }
  checkURL(url){
    var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    if (!re.test(url)) {
        return false;
    }
    return true;
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

  handleClick(){
    console.log(this.state);
    window.open(this.state.dataJSON.card_data.data.url,'_blank');
  }

  renderSixteenCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = this.state.dataJSON.card_data.data.faviconurl;
      let str = this.state.dataJSON.card_data.data.url;
      let arr = str && str.split("/");
      console.log(arr);
      let name = undefined;
      let dom = arr && arr[2];
      if(this.state.domain === dom){
        fav = undefined;
      }
      let byline = this.state.dataJSON.card_data.data.byline;
      let date=this.state.dataJSON.card_data.data.publishedat;
      let show = '';
      if(byline){
        show=show+'By '+byline;
      }
      if(byline && date && date != NaN){
        show=show+' . ';
      }
      if(date && date != NaN){
        show = show+ta.ago(date);
      }
      let light = this.state.dataJSON.card_data.data.imageurl;
      if(!this.checkURL(light)){
        light = undefined;
      }
      let series = this.state.dataJSON.card_data.data.series,
      genre = this.state.dataJSON.card_data.data.genre;
      let leftPadding = '1px';
      if(series){
        leftPadding = '5px';
      }
      if(!series && !genre){
        leftPadding = '0px';
      }
      return(
        <div onClick={()=>{ this.handleClick() }}>
          <div className="col-16-story-card">
          {light ? <img className="image-styling" style={{width: 1260}} src={light}></img>: null}
            {light ? <div className="title-background"></div> : null}
            <div className="bottom-pull-div">
              <div className="card-tags">
                {fav ?
                <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.card_data.data.iconbgcolor || 'white'}}>
                  <img className="favicon" src = {fav}/>
                </div> : null}
                <div className="series-name" style={{ padding: series || genre ? '1px' : '0px',paddingLeft: leftPadding}}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                  {genre } </div> : null}
                  </div>
                    <div className="sub-genre-light" style={{fontStyle:this.state.dataJSON.card_data.data.sponsored? 'italic': 'normal', textDecoration:this.state.dataJSON.card_data.data.sponsored? 'underline' : 'none'}}>
                      {this.state.dataJSON.card_data.data.sponsored ?'Sponsored': this.state.dataJSON.card_data.data.subgenre}
                    </div>
              </div>
              <div className="article-title">
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line">
                {show}
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
      let genreColor = "rgba(51, 51, 51, 0.75)",
          genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = this.state.dataJSON.card_data.data.faviconurl;
      let str = this.state.dataJSON.card_data.data.url;
      let arr = str && str.split("/");
      let name = undefined;
      let dom = arr && (arr[2]);
      if(this.state.domain === dom){
        fav = undefined;
      }
      let light = this.state.dataJSON.card_data.data.imageurl;
      if(!this.checkURL(light)){
        light = undefined;
      }
      let byline = this.state.dataJSON.card_data.data.byline;
      let date=this.state.dataJSON.card_data.data.publishedat;
      let show = '';
      if(byline){
        show=show+'By '+byline;
      }
      if(byline && date && date != NaN){
        show=show+' . ';
      }
      if(date && date != NaN){
        show = show+ta.ago(date);
      }
      let series = this.state.dataJSON.card_data.data.series,
      genre = this.state.dataJSON.card_data.data.genre;
      let leftPadding = '1px';
      if(series){
        leftPadding = '5px';
      }
      if(!series && !genre){
        leftPadding = '0px';
      }
      return(
        <div onClick={()=>{ this.handleClick() }}>
          <div className="col-7-story-card">
            {light ? <img className="image-styling" style={{width: 540}} src={light}></img> : <div  className="image-styling" style={{backgroundColor:'#fafafa', height:250, width:540}}></div>}
            {light ? <div className="title-background"></div> : null}
            <div className="card-tags">
            {fav ?
                <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.card_data.data.iconbgcolor || 'white'}}>
                  <img className="favicon" src = {fav}/>
                </div> : null}
                <div className="series-name" style={{ padding: series || genre ? '1px' : '0px',paddingLeft: leftPadding}}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                  {genre } </div> : null}</div>
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-genre-dark" style={{color: light ?'white' :'black',fontStyle:this.state.dataJSON.card_data.data.sponsored? 'italic': 'normal', textDecoration:this.state.dataJSON.card_data.data.sponsored? 'underline' : 'none' }}>Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line" style={{color: light ?'white' :'black' }}>
                {show}
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
      let genreColor = "rgba(51, 51, 51, 0.75)",
          genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = this.state.dataJSON.card_data.data.faviconurl;
      let str = this.state.dataJSON.card_data.data.url;
      let arr = str && str.split("/");
      let name = undefined;
      let dom = arr && (arr[2]);
      if(this.state.domain === dom){
        fav = undefined;
      }
      let light = this.state.dataJSON.card_data.data.imageurl;
      if(!this.checkURL(light)){
        light = undefined;
      }
      let byline = this.state.dataJSON.card_data.data.byline;
      let date=this.state.dataJSON.card_data.data.publishedat;
      let show = '';
      if(byline){
        show=show+'By '+byline;
      }
      if(byline && date && date != NaN){
        show=show+' . ';
      }
      if(date && date != NaN){
        show = show+ta.ago(date);
      }
      let series = this.state.dataJSON.card_data.data.series,
      genre = this.state.dataJSON.card_data.data.genre;
      let leftPadding = '1px';
      if(series){
        leftPadding = '5px';
      }
      if(!series && !genre){
        leftPadding = '0px';
      }
      return(
        <div onClick={()=>{ this.handleClick() }}>
          <div className="col-4-story-card">
            {light ? <img className="image-styling" style={{height:250}} src={light}></img>: <div  className="image-styling" style={{backgroundColor:'#fafafa', height:250, width:300}}></div>}
            {light ? <div className="title-background"></div> : null}
            <div className="card-tags">
            {fav ?
                <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.card_data.data.iconbgcolor || 'white'}}>
                  <img className="favicon" src = {fav}/>
                </div> : null}
                <div className="series-name" style={{ padding: series || genre ? '1px' : '0px',paddingLeft: leftPadding}}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                  {genre } </div> : null}</div>
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-genre-dark" style={{color: light ?'white' :'black',fontStyle:this.state.dataJSON.card_data.data.sponsored? 'italic': 'normal', textDecoration:this.state.dataJSON.card_data.data.sponsored? 'underline' : 'none' }}>Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line" style={{color: light ?'white' :'black' }}>
                {show}
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
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = this.state.dataJSON.card_data.data.faviconurl;
      let str = this.state.dataJSON.card_data.data.url;
      let arr = str && str.split("/");
      let name = undefined;
      let dom = arr && (arr[2]);
      if(this.state.domain === dom){
        fav = undefined;
      }
      let light = this.state.dataJSON.card_data.data.imageurl;
      if(!this.checkURL(light)){
        light = undefined;
      }
      let byline = this.state.dataJSON.card_data.data.byline;
      let date=this.state.dataJSON.card_data.data.publishedat;
      let show = '';
      if(byline){
        show=show+'By '+byline;
      }
      if(byline && date && date != NaN){
        show=show+' . ';
      }
      if(date && date != NaN){
        show = show+ta.ago(date);
      }
      let series = this.state.dataJSON.card_data.data.series,
      genre = this.state.dataJSON.card_data.data.genre;
      let leftPadding = '1px';
      if(series){
        leftPadding = '5px';
      }
      if(!series && !genre){
        leftPadding = '0px';
      }
      return(
        <div onClick={()=>{ this.handleClick() }}>
          <div className="col-3-story-card" >
            {light ? <img className="image-styling" style={{height:250}} src={light}></img>: <div className="image-styling" style={{backgroundColor:'#fafafa',height:250, width:220}}></div>}
            {light ? <div className="title-background"></div> : null}
            <div className="card-tags">
            {fav ?
                <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.card_data.data.iconbgcolor || 'white'}}>
                  <img className="favicon" src = {fav}/>
                </div> : null}
                <div className="series-name" style={{ padding: series || genre ? '1px' : '0px',paddingLeft: leftPadding}}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                  {genre } </div> : null}</div>
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-genre-dark" style={{color: light ?'white' :'black',fontStyle:this.state.dataJSON.card_data.data.sponsored? 'italic': 'normal', textDecoration:this.state.dataJSON.card_data.data.sponsored? 'underline' : 'none' }}>Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line" style={{color: light ?'white' :'black' }}>
                {show}
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
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = this.state.dataJSON.card_data.data.faviconurl;
      let str = this.state.dataJSON.card_data.data.url;
      let arr = str && str.split("/");
      let name = undefined;
      let dom = arr && (arr[2]);
      let light = this.state.dataJSON.card_data.data.imageurl;
      if(!this.checkURL(light)){
        light = undefined;
      }
      let byline = this.state.dataJSON.card_data.data.byline;
      let date=this.state.dataJSON.card_data.data.publishedat;
      let show = '';
      if(byline){
        show=show+'By '+byline;
      }
      if(byline && date && date != NaN){
        show=show+' . ';
      }
      if(date && date != NaN){
        show = show+ta.ago(date);
      }
      return(
        <div onClick={()=>{ this.handleClick() }}>
          <div className="col-2-story-card">
            {light ? <img className="image-styling" style={{height:250}} src={light}></img>: <div className="image-styling" style={{zIndex:'-1',backgroundColor:'#fafafa',height:250, width:140}}></div>}
            {light ? <div className="title-background"></div> : null}
            <div className="card-tags">
            {fav ? 
                <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.card_data.data.iconbgcolor || 'white', marginRight:'4px'}}>
                  <img className="favicon" src = {fav}/>
                </div> : null}
                <div className="series-name">{this.state.dataJSON.card_data.data.genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div> : null}</div>
            </div>
            <div className="bottom-pull-div">
              <div className="article-title" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line" style={{color: light ?'white' :'black' }}>
                {show}
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