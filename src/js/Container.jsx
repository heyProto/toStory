import React from 'react';
import { all as axiosAll, get as axiosGet, spread as axiosSpread } from 'axios';
import ta from 'time-ago';
import { parse as parseURL } from 'url';

export default class toStoryCard extends React.Component {
  constructor(props) {
    super(props)
    let stateVar = {
      fetchingData: true,
      dataJSON: {},
      domain: undefined,
      optionalConfigJSON: {},
    };

    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
      stateVar.languageTexts = this.getLanguageTexts(this.props.dataJSON.data.language);
    }

    if (this.props.optionalConfigJSON) {
      stateVar.optionalConfigJSON = this.props.optionalConfigJSON;
    }

    if(this.props.domain){
      stateVar.domain = this.props.domain;
    }

    if (this.props.siteConfigs) {
      stateVar.siteConfigs = this.props.siteConfigs;
    }

    this.state = stateVar;
  }

  componentDidMount() {
    if (this.state.fetchingData){
      let items_to_fetch = [
        axiosGet(this.props.dataURL)
      ];
      if (this.props.siteConfigURL) {
        items_to_fetch.push(axiosGet(this.props.siteConfigURL));
      }
      axiosAll(items_to_fetch).then(axiosSpread((card, site_configs) => {
        let stateVar = {
          fetchingData: false,
          dataJSON: card.data,
          optionalConfigJSON: {}
        };
        site_configs ? stateVar["siteConfigs"] = site_configs.data : stateVar["siteConfigs"] =  this.state.siteConfigs;

        stateVar.optionalConfigJSON.house_colour = stateVar.siteConfigs.house_colour;
        stateVar.optionalConfigJSON.reverse_house_colour = stateVar.siteConfigs.reverse_house_colour;
        stateVar.optionalConfigJSON.font_colour = stateVar.siteConfigs.font_colour;
        stateVar.optionalConfigJSON.reverse_font_colour = stateVar.siteConfigs.reverse_font_colour;
        stateVar.optionalConfigJSON.story_card_style = stateVar.siteConfigs.story_card_style;
        stateVar.optionalConfigJSON.story_card_flip = stateVar.siteConfigs.story_card_flip;
        stateVar.languageTexts = this.getLanguageTexts(stateVar.siteConfigs.primary_language.toLowerCase());
        this.setState(stateVar);
      }));
    } else {
      console.log("ISFromSSR", !this.props.isFromSSR);
      if (!this.props.renderingSSR) {
        this.componentDidUpdate();
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.dataJSON) {
      this.setState({
        dataJSON: nextProps.dataJSON
      });
    }
  }

  componentDidUpdate() {
    if (this.props.mode === 'col2'){
      this.ellipsizeTextBox();
    }
    if(this.state.optionalConfigJSON.story_card_flip && this.state.dataJSON.data.summary){
      let elem = document.querySelector('.protograph-summary-text');
      this.multiLineTruncate(elem);
    }
  }

  multiLineTruncate(el) {
    let data = this.state.dataJSON.data,
      wordArray = data.summary.split(' '),
      props = this.props;
    if (el) {
      while(el.scrollHeight > el.offsetHeight) {
        wordArray.pop();
        el.innerHTML = wordArray.join(' ') + '...' + '<br><a id="read-more-button" href="#" class="protograph-read-more">Read more</a>' ;
      }
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
    const data = this.state.dataJSON.data;
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

  ellipsizeTextBox() {
    let container = document.querySelector('.article-title'),
    text = document.querySelector('.article-title'),
      // text = document.querySelector(`.protograph-${this.props.mode}-mode .protograph-tocluster-title`),
      wordArray;
    let headline = this.state.dataJSON.data.headline;
    if(headline === '' || headline === undefined){
      text.innerHTML='';
    }else{
      // Setting the string to work with edit mode.
      text.innerHTML = this.state.dataJSON.data.headline;
      wordArray = this.state.dataJSON.data.headline.split(' ');
      while (container.offsetHeight > 80) {
        wordArray.pop();
        text.innerHTML = wordArray.join(' ') + '...';
      }
    }
  }

  handleClick(){
    window.open(this.state.dataJSON.data.url,'_top');
  }

  matchDomain(domain, url) {
    let url_domain = this.getDomainFromURL(url).replace(/^(https?:\/\/)?(www\.)?/, ''),
      domain_has_subdomain = this.subDomain(domain),
      url_has_subdomain = this.subDomain(url_domain);

    if (domain_has_subdomain) {
      return (domain === url_domain) || (domain.indexOf(url_domain) >= 0);
    }
    if (url_has_subdomain) {
      return (domain === url_domain) || (url_domain.indexOf(domain) >= 0);
    }
    return (domain === url_domain)
  }

  getDomainFromURL(url) {
    // let a = document.createElement('a');
    // a.href = url;
    let urlComponents = parseURL(url);
    return urlComponents.hostname;
  }

  subDomain(url) {
    if(!url){
      url = "";
    }
    // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
    url = url.replace(new RegExp(/^\s+/), ""); // START
    url = url.replace(new RegExp(/\s+$/), ""); // END

    // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
    url = url.replace(new RegExp(/\\/g), "/");

    // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
    url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i), "");

    // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
    url = url.replace(new RegExp(/^www\./i), "");

    // REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
    url = url.replace(new RegExp(/\/(.*)/), "");

    // REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
    if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
      url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i), "");

      // REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
    } else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
      url = url.replace(new RegExp(/\.[a-z]{2,4}$/i), "");
    }

    // CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
    var subDomain = (url.match(new RegExp(/\./g))) ? true : false;

    return (subDomain);
  }

  renderSixteenCol(){
    console.log("Fetching Data: ", this.state.fetchingData);
    if(this.state.fetchingData){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_colour;
        genreFontColor = this.state.optionalConfigJSON.font_colour;
      }
      if(this.state.dataJSON.data.sponsored){
        genreColor = this.state.optionalConfigJSON.reverse_house_colour;
        genreFontColor = this.state.optionalConfigJSON.reverse_font_colour;
      }
      let fav = this.state.dataJSON.data.faviconurl;
      let str = this.state.dataJSON.data.url;
      let left = this.state.dataJSON.data.left || 50;
      let top = this.state.dataJSON.data.top || 50;
      let transX,transY;
      let arr = str && str.split("/");
      let name = undefined;
      let dom = arr && arr[2];
      if (this.matchDomain(this.state.domain, str)) {
        fav = undefined;
      }
      let byline = this.state.dataJSON.data.byline;
      let date=this.state.dataJSON.data.publishedat;
      let focus=this.state.dataJSON.data.focus;
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
      let light = this.state.dataJSON.data.imageurl;
      if(!this.checkURL(light)){
        light = undefined;
      }
      let series = window.vertical_name || this.state.dataJSON.data.series,
      genre = this.state.dataJSON.data.genre;
      let padding = "1px 1px 1px 5px";
      if (!genre && series) {
        padding = "2.5px 5px";
      }
      if (!series && !genre) {
        padding = '0px';
      }
      if (genre && !series) {
        padding = "1px";
      }
      let styles = (focus === "h") ? {width: 1260} : {width: 680}
      if (light){
        switch(this.state.optionalConfigJSON.story_card_style){
          case "Clear: Black & White":
            styles = (focus === "h") ? {width: 1260, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"} : {width: 680, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"}
            break;
          case "Blur: Color":
            styles = (focus === "h") ? {width: 1260, WebkitFilter: "blur(5px)", filter: "blur(5px);"} : {width: 680, WebkitFilter: "blur(5px)", filter: "blur(5px);"}
            break;
        }
      }

      if (focus === "h") {
        styles.left = left+"%";
        styles.top = top+"%";
        transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
        transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
        styles.transform = `translate(-${transX}%,-${transY}%)`;
        return(
          <div onClick={()=>{ this.handleClick() }}>
            <div className="col-16-story-card">
              <div className="padding20">
                {light ? <img className="image-styling" style={styles} src={light}></img>: null}
                {light ? <div className="title-background"></div> : null}
                {light ? <div className="col-16-diag-grad"></div> : null}
                <div className="bottom-pull-div">
                  <div className="card-tags">
                    {fav ?
                    <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                      <img className="favicon" src = {fav}/>
                    </div> : null}
                    <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                      {genre } </div> : null}
                      </div>
                        <div className="sub-genre-light" style={{fontStyle:this.state.dataJSON.data.sponsored? 'italic': 'normal', textDecoration:this.state.dataJSON.data.sponsored? 'underline' : 'none'}}>
                          {this.state.dataJSON.data.sponsored ?'Sponsored': this.state.dataJSON.data.subgenre}
                        </div>
                  </div>
                  <div className="article-title">
                    {this.state.dataJSON.data.headline}
                  </div>
                  <div className="by-line">
                    {(!this.state.dataJSON.data.hide_byline) && show}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      } else {
        return (
          <div onClick={()=>{ this.handleClick() }}>
            <div className="col-16-story-card">
              <div className="col-16-block-left bottom-pull-div">
                <div className="card-tags">
                  {fav ?
                  <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                    <img className="favicon" src = {fav}/>
                  </div> : null}
                  <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                    {genre } </div> : null}
                  </div>
                  <div className="sub-genre-light" style={{fontStyle:this.state.dataJSON.data.sponsored? 'italic': 'normal', textDecoration:this.state.dataJSON.data.sponsored? 'underline' : 'none'}}>
                    {this.state.dataJSON.data.sponsored ?'Sponsored': this.state.dataJSON.data.subgenre}
                  </div>
                </div>
                <div className="article-title">
                  {this.state.dataJSON.data.headline}
                </div>
                <div className="by-line">
                  {(!this.state.dataJSON.data.hide_byline) && show}
                </div>
              </div>
              <div className="col-16-block-right">
                {light ? <img className="image-styling-v" style={styles} src={light}></img>: null}
                {light ? <div className="title-background"></div> : null}
                {light ? <div className="col-16-diag-grad"></div> : null}
              </div>
            </div>
          </div>
        )
      }
    }
  }

  renderSevenCol(){
    if(this.state.fetchingData){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)",
          genreFontColor = "#fff";
      if(this.state.dataJSON.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_colour;
        genreFontColor = this.state.optionalConfigJSON.font_colour;
      }
      if(this.state.dataJSON.data.sponsored){
        genreColor = this.state.optionalConfigJSON.reverse_house_colour;
        genreFontColor = this.state.optionalConfigJSON.reverse_font_colour;
      }
      let fav = this.state.dataJSON.data.faviconurl;
      let str = this.state.dataJSON.data.url;
      let left = this.state.dataJSON.data.left || 50;
      let top = this.state.dataJSON.data.top || 50;
      let transX,transY;
      // let arr = str && str.split("/");
      let name = undefined;
      // let dom = arr && (arr[2]);
      if (this.matchDomain(this.state.domain, str)){
        fav = undefined;
      }
      let light = this.state.dataJSON.data.col7imageurl;
      if (!this.state.dataJSON.data.col7imageurl) {
        light = this.state.dataJSON.data.imageurl;
      }
      if(!this.checkURL(light)){
        light = undefined;
      }
      let byline = this.state.dataJSON.data.byline;
      let date=this.state.dataJSON.data.publishedat;
      let focus=this.state.dataJSON.data.focus;
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
      let series = window.vertical_name || this.state.dataJSON.data.series,
      genre = this.state.dataJSON.data.genre;
      let padding = "1px 1px 1px 5px";
      if (!genre && series) {
        padding = "2.5px 5px";
      }
      if (!series && !genre) {
        padding = '0px';
      }
      if (genre && !series) {
        padding = "1px";
      }
      let styles = (focus === "h") ? {width: 540} : {width: '100%', height: 250}
      if (light){
        switch(this.state.optionalConfigJSON.story_card_style){
          case "Clear: Black & White":
            styles = (focus === "h") ? {width: 540, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"} : {width: '100%', WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);" , height: 250}
            break;
          case "Blur: Color":
            styles = (focus === "h") ? {width: 540, WebkitFilter: "blur(5px)", filter: "blur(5px);"} : {width: '100%', WebkitFilter: "blur(5px)", filter: "blur(5px);" , height: 250}
            break;
        }
      }
      let left_block_width;
      if (light){
        left_block_width = {width: 240}
      }

      if(this.state.optionalConfigJSON.story_card_flip && this.state.dataJSON.data.summary){
        if (focus === "h"){
          styles.left = left+"%";
          styles.top = top+"%";
          transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
          transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
          styles.transform = `translate(-${transX}%,-${transY}%)`;
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-7-story-card">
                <div className="flip-container" style={{position: "relative"}}>
                  <div className="flipper" style={{position: "relative",height: 250}}>
                    <div className="front" style={{position: "relative",height: 250}}>
                      <div className="padding12">
                        {light ? <img className="image-styling" style={styles} src={light}></img> : <div  className="image-styling" style={{backgroundColor:'#fafafa', height:250, width:540}}></div>}
                        {light ? <div className="title-background"></div> : null}
                        <div className="card-tags">
                        {fav ?
                            <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                              <img className="favicon" src = {fav}/>
                            </div> : null}
                        <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                              {genre } </div> : null}</div>
                          <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                            {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                          </div>
                        </div>
                        <div className="bottom-pull-div">
                          <div className="article-title" style={{color: light ?'white' :'black' }}>
                            {this.state.dataJSON.data.headline}
                          </div>
                          <div className="by-line" style={{color: light ?'white' :'black' }}>
                            {(!this.state.dataJSON.data.hide_byline) && show}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="back" style={{height: 250}}>
                      <div className="padding12">
                        <p className="protograph-summary-text" style={{ fontFamily: this.state.languageTexts.font, maxHeight: 225 }}>{this.state.dataJSON.data.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        else {
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-7-story-card" style={{backgroundColor: "#fafafa"}}>
                <div className="flip-container" style={{position: "relative"}}>
                  <div className="flipper" style={{position: "relative",height: 250}}>
                    <div className="front" style={{position: "relative",height: 250}}>
                    <div className="card-tags" style={{position:'absolute',top:'0px', padding:'12px'}}>
                        {fav ?
                            <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                              <img className="favicon" src = {fav}/>
                            </div> : null}
                        <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                              {genre } </div> : null}</div>
                        <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                          {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                        </div>
                      </div>
                      <div className="col-7-block-left bottom-pull-div" style={left_block_width}>
                        <div className="article-title" style={{color:'black' }}>
                          {this.state.dataJSON.data.headline}
                        </div>
                        <div className="by-line" style={{color: '#8e8e8e' }}>
                          {(!this.state.dataJSON.data.hide_byline) && show}
                        </div>
                      </div>
                      <div className="col-7-block-right">
                        <img style={styles} src={light}></img>
                        {light ? <div className="title-background"></div> : null}
                      </div>
                    </div>
                    <div className="back" style={{height: 250}}>
                      <div className="padding12">
                        <p className="protograph-summary-text" style={{ fontFamily: this.state.languageTexts.font, maxHeight: 225 }}>{this.state.dataJSON.data.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      } else {
        if (focus === "h"){
          styles.left = left+"%";
          styles.top = top+"%";
          transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
          transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
          styles.transform = `translate(-${transX}%,-${transY}%)`;
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-7-story-card">
                <div className='padding12'>
                  {light ? <img className="image-styling" style={styles} src={light}></img> : <div  className="image-styling" style={{backgroundColor:'#fafafa', height:250, width:540}}></div>}
                  {light ? <div className="title-background"></div> : null}
                  <div className="card-tags">
                      {fav ?
                          <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                            <img className="favicon" src = {fav}/>
                          </div> : null}
                      <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                            {genre } </div> : null}</div>
                    <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                      {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                    </div>
                  </div>
                  <div className="bottom-pull-div">
                    <div className="article-title" style={{color: light ?'white' :'black' }}>
                      {this.state.dataJSON.data.headline}
                    </div>
                    <div className="by-line" style={{color: light ?'white' :'black' }}>
                      {(!this.state.dataJSON.data.hide_byline) && show}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-7-story-card" style={{backgroundColor: "#fafafa"}}>
              <div className="card-tags" style={{position:'absolute',top:'0px', padding:'12px'}}>
                    {fav ?
                        <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                          <img className="favicon" src = {fav}/>
                        </div> : null}
                    <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                          {genre } </div> : null}</div>
                  <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                    {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                  </div>
                  </div>
                <div className="col-7-block-left bottom-pull-div" style={left_block_width}>

                  <div className="article-title" style={{color:'black' }}>
                    {this.state.dataJSON.data.headline}
                  </div>
                  <div className="by-line" style={{color: '#8e8e8e' }}>
                    {(!this.state.dataJSON.data.hide_byline) && show}
                  </div>
                </div>
                <div className="col-7-block-right">
                  <img style={styles} src={light}></img>
                  {light ? <div className="title-background"></div> : null}
                </div>
              </div>
            </div>
          )
        }
      }

    }
  }

  renderFourCol(){
    if(this.state.fetchingData){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)",
          genreFontColor = "#fff";
      if(this.state.dataJSON.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_colour;
        genreFontColor = this.state.optionalConfigJSON.font_colour;
      }
      if(this.state.dataJSON.data.sponsored){
        genreColor = this.state.optionalConfigJSON.reverse_house_colour;
        genreFontColor = this.state.optionalConfigJSON.reverse_font_colour;
      }
      let fav = this.state.dataJSON.data.faviconurl;
      let str = this.state.dataJSON.data.url;
      let left = this.state.dataJSON.data.left || 50;
      let top = this.state.dataJSON.data.top || 50;
      let transX,transY;
      let arr = str && str.split("/");
      let name = undefined;
      let dom = arr && (arr[2]);
      if (this.matchDomain(this.state.domain, str)) {
        fav = undefined;
      }
      let light = this.state.dataJSON.data.col7imageurl;
      if (!this.state.dataJSON.data.col7imageurl) {
        light = this.state.dataJSON.data.imageurl;
      }
      if(!this.checkURL(light)){
        light = undefined;
      }
      let byline = this.state.dataJSON.data.byline;
      let date=this.state.dataJSON.data.publishedat;
      let focus=this.state.dataJSON.data.focus;
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
      let series = window.vertical_name || this.state.dataJSON.data.series,
      genre = this.state.dataJSON.data.genre;
      let padding = "1px 1px 1px 5px";
      if (!genre && series) {
        padding = "2.5px 5px";
      }
      if (!series && !genre) {
        padding = '0px';
      }
      if (genre && !series) {
        padding = "1px";
      }
      let styles = (focus === "h") ? {height: 250} : {height: 150}
      if (light){
        switch(this.state.optionalConfigJSON.story_card_style){
          case "Clear: Black & White":
            styles = (focus === "h") ? {height: 250, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"} : {height: 150, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"}
            break;
          case "Blur: Color":
            styles = (focus === "h") ? {height: 250, WebkitFilter: "blur(5px)", filter: "blur(5px);"} : {height: 150, WebkitFilter: "blur(5px)", filter: "blur(5px);"}
            break;
        }
      }

      if(this.state.optionalConfigJSON.story_card_flip && this.state.dataJSON.data.summary){
        if (focus === "h"){
          styles.left = left+"%";
          styles.top = top+"%";
          transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
          transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
          styles.transform = `translate(-${transX}%,-${transY}%)`;
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-4-story-card">
                <div className="flip-container" style={{position: "relative"}}>
                  <div className="flipper" style={{position: "relative",height: 250}}>
                    <div className="front" style={{position: "relative",height: 250}}>
                      <div className="padding12">
                        {light ? <img className="image-styling" style={styles} src={light}></img>: <div  className="image-styling" style={{backgroundColor:'#fafafa', height:250, width:300}}></div>}
                        {light ? <div className="title-background"></div> : null}
                        <div className="card-tags">
                        {fav ?
                            <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                              <img className="favicon" src = {fav}/>
                            </div> : null}
                        <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                              {genre } </div> : null}</div>
                          <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                            {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                          </div>
                        </div>
                        <div className="bottom-pull-div">
                          <div className="article-title" style={{color: light ?'white' :'black' }}>
                            {this.state.dataJSON.data.headline}
                          </div>
                          <div className="by-line" style={{color: light ?'white' :'black' }}>
                            {(!this.state.dataJSON.data.hide_byline) && show}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="back" style={{height: 250}}>
                      <div className="padding12">
                        <p className="protograph-summary-text" style={{ fontFamily: this.state.languageTexts.font, maxHeight: 225 }}>{this.state.dataJSON.data.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-4-story-card">
                <div className="flip-container" style={{position: "relative"}}>
                  <div className="flipper" style={{position: "relative",height: 250}}>
                    <div className="front" style={{position: "relative",height: 250}}>
                      <div className="col-4-block-top">
                        <img className="image-centering" style={styles} src={light}></img>
                        <div className="card-tags padding12" style={{top:0, position:'absolute'}}>
                          {fav ?
                              <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                                <img className="favicon" src = {fav}/>
                              </div> : null}
                          <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                                {genre } </div> : null}</div>
                          <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                            {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                          </div>
                        </div>
                      </div>
                      <div className="col-4-block-bottom">
                        <div className="bottom-pull-div">
                          <div className="article-title" style={{color: 'black', maxHeight:25, overflow:'hidden' }}>
                            {this.state.dataJSON.data.headline}
                          </div>
                          <div className="by-line" style={{color: '#8e8e8e' }}>
                            {(!this.state.dataJSON.data.hide_byline) && show}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="back" style={{height: 250}}>
                      <div className="padding12">
                        <p className="protograph-summary-text" style={{ fontFamily: this.state.languageTexts.font, maxHeight: 225 }}>{this.state.dataJSON.data.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      } else {
        if (focus === "h"){
          styles.left = left+"%";
          styles.top = top+"%";
          transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
          transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
          styles.transform = `translate(-${transX}%,-${transY}%)`;
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-4-story-card">
                <div className="padding12">
                  {light ? <img className="image-styling" style={styles} src={light}></img>: <div  className="image-styling" style={{backgroundColor:'#fafafa', height:250, width:300}}></div>}
                  {light ? <div className="title-background"></div> : null}
                  <div className="card-tags">
                  {fav ?
                      <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                        <img className="favicon" src = {fav}/>
                      </div> : null}
                  <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                        {genre } </div> : null}</div>
                    <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                      {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                    </div>
                  </div>
                  <div className="bottom-pull-div">
                    <div className="article-title" style={{color: light ?'white' :'black' }}>
                      {this.state.dataJSON.data.headline}
                    </div>
                    <div className="by-line" style={{color: light ?'white' :'black' }}>
                      {(!this.state.dataJSON.data.hide_byline) && show}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-4-story-card">
                <div className="col-4-block-top">
                  <img className="image-centering" style={styles} src={light}></img>
                  <div className="card-tags padding12" style={{top:0, position:'absolute'}}>
                    {fav ?
                        <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                          <img className="favicon" src = {fav}/>
                        </div> : null}
                    <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                          {genre } </div> : null}</div>
                    <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                      {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                    </div>
                  </div>
                </div>
                <div className="col-4-block-bottom">
                  <div className="bottom-pull-div">
                    <div className="article-title" style={{color: 'black', maxHeight:25, overflow:'hidden' }}>
                      {this.state.dataJSON.data.headline}
                    </div>
                    <div className="by-line" style={{color: '#8e8e8e' }}>
                      {(!this.state.dataJSON.data.hide_byline) && show}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      }
    }
  }

  renderThreeCol(){
    if(this.state.fetchingData){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_colour;
        genreFontColor = this.state.optionalConfigJSON.font_colour;
      }
      if(this.state.dataJSON.data.sponsored){
        genreColor = this.state.optionalConfigJSON.reverse_house_colour;
        genreFontColor = this.state.optionalConfigJSON.reverse_font_colour;
      }
      let fav = this.state.dataJSON.data.faviconurl;
      let str = this.state.dataJSON.data.url;
      let left = this.state.dataJSON.data.left || 50;
      let top = this.state.dataJSON.data.top || 50;
      let transX,transY;
      let arr = str && str.split("/");
      let name = undefined;
      let dom = arr && (arr[2]);
      if (this.matchDomain(this.state.domain, str)) {
        fav = undefined;
      }
      let light = this.state.dataJSON.data.col7imageurl;
      if (!this.state.dataJSON.data.col7imageurl) {
        light = this.state.dataJSON.data.imageurl;
      }
      if(!this.checkURL(light)){
        light = undefined;
      }
      let byline = this.state.dataJSON.data.byline;
      let date=this.state.dataJSON.data.publishedat;
      let focus=this.state.dataJSON.data.focus;
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
      let series = window.vertical_name || this.state.dataJSON.data.series,
      genre = this.state.dataJSON.data.genre;
      let padding = "1px 1px 1px 5px";
      if (!genre && series) {
        padding = "2.5px 5px";
      }
      if (!series && !genre) {
        padding = '0px';
      }
      if (genre && !series) {
        padding = "1px";
      }
      let styles = (focus === "h") ? {height: 250} : {height: 132}
      if (light){
        switch(this.state.optionalConfigJSON.story_card_style){
          case "Clear: Black & White":
            styles = (focus === "h") ? {height: 250, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"} : {height: 132, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"}
            break;
          case "Blur: Color":
            styles = (focus === "h") ? {height: 250, WebkitFilter: "blur(5px)", filter: "blur(5px);"} : {height: 132, WebkitFilter: "blur(5px)", filter: "blur(5px);"}
            break;
        }

      }
      if(this.state.optionalConfigJSON.story_card_flip && this.state.dataJSON.data.summary){
        if (focus === "h"){
          styles.left = left+"%";
          styles.top = top+"%";
          transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
          transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
          styles.transform = `translate(-${transX}%,-${transY}%)`;
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-3-story-card">
                <div className="flip-container" style={{position: "relative"}}>
                  <div className="flipper" style={{position: "relative",height: 250}}>
                    <div className="front" style={{position: "relative",height: 250}}>
                      <div className="padding12">
                        {light ? <img className="image-styling" style={styles} src={light}></img>: <div  className="image-styling" style={{backgroundColor:'#fafafa', height:250, width:300}}></div>}
                        {light ? <div className="title-background"></div> : null}
                        <div className="card-tags">
                        {fav ?
                            <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                              <img className="favicon" src = {fav}/>
                            </div> : null}
                        <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                              {genre } </div> : null}</div>
                          <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                            {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                          </div>
                        </div>
                        <div className="bottom-pull-div">
                          <div className="article-title" style={{color: light ?'white' :'black' }}>
                            {this.state.dataJSON.data.headline}
                          </div>
                          <div className="by-line" style={{color: light ?'white' :'black' }}>
                            {(!this.state.dataJSON.data.hide_byline) && show}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="back" style={{height: 250}}>
                      <div className="padding12">
                        <p className="protograph-summary-text" style={{ fontFamily: this.state.languageTexts.font, maxHeight: 225 }}>{this.state.dataJSON.data.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-3-story-card">
                <div className="flip-container" style={{position: "relative"}}>
                  <div className="flipper" style={{position: "relative",height: 250}}>
                    <div className="front" style={{position: "relative",height: 250}}>
                      <div className="col-3-block-top">
                        <img className="image-centering" style={styles} src={light}></img>
                        <div className="card-tags padding12" style={{top:0, position:'absolute'}}>
                          {fav ?
                              <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                                <img className="favicon" src = {fav}/>
                              </div> : null}
                          <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                                {genre } </div> : null}</div>
                          <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                            {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                          </div>
                        </div>
                      </div>
                      <div className="col-3-block-bottom">
                        <div className="bottom-pull-div">
                          <div className="article-title" style={{color: 'black', maxHeight: 55}}>
                            {this.state.dataJSON.data.headline}
                          </div>
                          <div className="by-line" style={{color: '#8e8e8e' }}>
                            {(!this.state.dataJSON.data.hide_byline) && show}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="back" style={{height: 250}}>
                      <div className="padding12">
                        <p className="protograph-summary-text" style={{ fontFamily: this.state.languageTexts.font, maxHeight: 225 }}>{this.state.dataJSON.data.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      } else {
        if (focus === "h"){
          styles.left = left+"%";
          styles.top = top+"%";
          transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
          transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
          styles.transform = `translate(-${transX}%,-${transY}%)`;
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-3-story-card" >
                <div className="padding12">
                  {light ? <img className="image-styling" style={styles} src={light}></img>: <div className="image-styling" style={{backgroundColor:'#fafafa',height:250, width:220}}></div>}
                  {light ? <div className="title-background"></div> : null}
                  <div className="card-tags">
                  {fav ?
                      <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                        <img className="favicon" src = {fav}/>
                      </div> : null}
                  <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                        {genre } </div> : null}</div>
                    <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                      {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                    </div>
                  </div>
                  <div className="bottom-pull-div">
                    <div className="article-title" style={{color: light ?'white' :'black' }}>
                      {this.state.dataJSON.data.headline}
                    </div>
                    <div className="by-line" style={{color: light ?'white' :'black' }}>
                      {(!this.state.dataJSON.data.hide_byline) && show}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-3-story-card">
                <div className="col-3-block-top">
                  <img className="image-centering" style={styles} src={light}></img>
                  <div className="card-tags padding12" style={{top:0, position:'absolute'}}>
                    {fav ?
                        <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white'}}>
                          <img className="favicon" src = {fav}/>
                        </div> : null}
                    <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                          {genre } </div> : null}</div>
                    <div className="sub-genre-light" style={{ fontStyle: this.state.dataJSON.data.sponsored ? 'italic' : 'normal', textDecoration: this.state.dataJSON.data.sponsored ? 'underline' : 'none' }}>
                      {this.state.dataJSON.data.sponsored ? 'Sponsored' : this.state.dataJSON.data.subgenre}
                    </div>
                  </div>
                </div>
                <div className="col-3-block-bottom">
                  <div className="bottom-pull-div">
                    <div className="article-title" style={{color: 'black', maxHeight: 55}}>
                      {this.state.dataJSON.data.headline}
                    </div>
                    <div className="by-line" style={{color: '#8e8e8e' }}>
                      {(!this.state.dataJSON.data.hide_byline) && show}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      }
    }
  }

  renderTwoCol(){
    if(this.state.fetchingData){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_colour;
        genreFontColor = this.state.optionalConfigJSON.font_colour;
      }
      if(this.state.dataJSON.data.sponsored){
        genreColor = this.state.optionalConfigJSON.reverse_house_colour;
        genreFontColor = this.state.optionalConfigJSON.reverse_font_colour;
      }
      let fav = this.state.dataJSON.data.faviconurl;
      let str = this.state.dataJSON.data.url;
      let left = this.state.dataJSON.data.left || 50;
      let top = this.state.dataJSON.data.top || 50;
      let transX,transY;
      let arr = str && str.split("/");
      let name = undefined;
      let dom = arr && (arr[2]);
      if (this.matchDomain(this.state.domain, str)) {
        fav = undefined;
      }
      let light = this.state.dataJSON.data.col7imageurl;
      if (!this.state.dataJSON.data.col7imageurl) {
        light = this.state.dataJSON.data.imageurl;
      }
      if(!this.checkURL(light)){
        light = undefined;
      }
      let byline = this.state.dataJSON.data.byline;
      let date=this.state.dataJSON.data.publishedat;
      let focus=this.state.dataJSON.data.focus;
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
      let series = window.vertical_name || this.state.dataJSON.data.series,
        genre = this.state.dataJSON.data.genre;
      let padding = genre ? "1px" : "0px" ;
      let styles = (focus === "h") ? {height: 250} : {height: 84}
      if (light){
        switch(this.state.optionalConfigJSON.story_card_style){
          case "Clear: Black & White":
            styles = (focus === "h") ? {height: 250, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"} : {height: 84, WebkitFilter: "grayscale(100%)", filter: "grayscale(100%);"}
            break;
          case "Blur: Color":
            styles = (focus === "h") ? {height: 250, WebkitFilter: "blur(5px)", filter: "blur(5px);"} : {height: 84, WebkitFilter: "blur(5px)", filter: "blur(5px);"}
            break;
        }
      }
      if(this.state.optionalConfigJSON.story_card_flip && this.state.dataJSON.data.summary){
        if (focus === "h") {
          styles.left = left+"%";
          styles.top = top+"%";
          transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
          transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
          styles.transform = `translate(-${transX}%,-${transY}%)`;
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-2-story-card">
                <div className="flip-container" style={{position: "relative"}}>
                  <div className="flipper" style={{position: "relative",height: 250}}>
                    <div className="front" style={{position: "relative",height: 250}}>
                      <div className="padding12">
                        {light ? <img className="image-styling" style={styles} src={light}></img>: <div className="image-styling" style={{zIndex:'-1',backgroundColor:'#fafafa',height:250, width:140}}></div>}
                        {light ? <div className="title-background"></div> : null}
                        <div className="card-tags">
                        {fav ?
                            <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white', marginRight:'4px'}}>
                              <img className="favicon" src = {fav}/>
                            </div> : null}
                        <div className="series-name" style={{ padding: padding }}>{this.state.dataJSON.data.genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor}}>
                              {this.state.dataJSON.data.genre } </div> : null}</div>
                        </div>
                        <div className="bottom-pull-div">
                          <div className="article-title" style={{color: light ?'white' :'black' }}>
                            {this.state.dataJSON.data.headline}
                          </div>
                          <div className="by-line" style={{color: light ?'white' :'black' }}>
                            {(!this.state.dataJSON.data.hide_byline) && show}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="back" style={{height: 250}}>
                      <div className="padding12">
                        <p className="protograph-summary-text" style={{ fontFamily: this.state.languageTexts.font, maxHeight: 225 }}>{this.state.dataJSON.data.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-2-story-card">
                <div className="flip-container" style={{position: "relative"}}>
                  <div className="flipper" style={{position: "relative",height: 250}}>
                    <div className="front" style={{position: "relative",height: 250}}>
                      <div className="col-2-block-top">
                        <img className="image-centering" style={styles} src={light}></img>
                        <div className="card-tags padding12" style={{top:0, position:'absolute'}}>
                        {fav ?
                            <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white', marginRight:'4px'}}>
                              <img className="favicon" src = {fav}/>
                            </div> : null}
                        <div className="series-name" style={{ padding: padding }}>{this.state.dataJSON.data.genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor}}>
                              {this.state.dataJSON.data.genre } </div> : null}</div>
                        </div>
                      </div>
                      <div className="col-2-block-bottom">
                        <div className="bottom-pull-div">
                          <div className="article-title" style={{color: 'black'}}>
                            {this.state.dataJSON.data.headline}
                          </div>
                          <div className="by-line" style={{color: '#8e8e8e' }}>
                            {(!this.state.dataJSON.data.hide_byline) && show}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="back" style={{height: 250}}>
                      <div className="padding12">
                        <p className="protograph-summary-text" style={{ fontFamily: this.state.languageTexts.font, maxHeight: 225 }}>{this.state.dataJSON.data.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      } else {
        if (focus === "h") {
          styles.left = left+"%";
          styles.top = top+"%";
          transX = ((100 - left) >= 0 && (100 - left) <= 100) ? 100 - left : ((100 - left) < 0)? 0 : 100;
          transY = ((100 - top) >= 0 && (100 - top) <= 100) ? 100 - top: ((100 - top) < 0)? 0 : 100;
          styles.transform = `translate(-${transX}%,-${transY}%)`;
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-2-story-card">
                <div className="padding12">
                  {light ? <img className="image-styling" style={styles} src={light}></img>: <div className="image-styling" style={{zIndex:'-1',backgroundColor:'#fafafa',height:250, width:140}}></div>}
                  {light ? <div className="title-background"></div> : null}
                  <div className="card-tags">
                  {fav ?
                      <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white', marginRight:'4px'}}>
                        <img className="favicon" src = {fav}/>
                      </div> : null}
                  <div className="series-name" style={{ padding: padding }}>{this.state.dataJSON.data.genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor}}>
                        {this.state.dataJSON.data.genre } </div> : null}</div>
                  </div>
                  <div className="bottom-pull-div">
                    <div className="article-title" style={{color: light ?'white' :'black' }}>
                      {this.state.dataJSON.data.headline}
                    </div>
                    <div className="by-line" style={{color: light ?'white' :'black' }}>
                      {(!this.state.dataJSON.data.hide_byline) && show}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return(
            <div onClick={()=>{ this.handleClick() }}>
              <div className="col-2-story-card">
                <div className="col-2-block-top">
                  <img className="image-centering" style={styles} src={light}></img>
                  <div className="card-tags padding12" style={{top:0, position:'absolute'}}>
                  {fav ?
                      <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.data.iconbgcolor || 'white', marginRight:'4px'}}>
                        <img className="favicon" src = {fav}/>
                      </div> : null}
                  <div className="series-name" style={{ padding: padding }}>{this.state.dataJSON.data.genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor}}>
                        {this.state.dataJSON.data.genre } </div> : null}</div>
                  </div>
                </div>
                <div className="col-2-block-bottom">
                  <div className="bottom-pull-div">
                    <div className="article-title" style={{color: 'black'}}>
                      {this.state.dataJSON.data.headline}
                    </div>
                    <div className="by-line" style={{color: '#8e8e8e' }}>
                      {(!this.state.dataJSON.data.hide_byline) && show}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      }
    }
  }

  getLanguageTexts(languageConfig) {
    let language = languageConfig ? languageConfig : "hindi",
      text_obj;

    switch(language.toLowerCase()) {
      case "hindi":
        text_obj = {
          font: "'Sarala', sans-serif"
        }
        break;
      default:
        text_obj = {
          font: undefined
        }
        break;
    }
    return text_obj;
  }

  render() {
    switch(this.props.mode) {
      case 'col16':
        return this.renderSixteenCol();
      case 'col7':
        return this.renderSevenCol();
      case 'col4':
        return this.renderFourCol();
      case 'col3':
        return this.renderThreeCol();
      case 'col2':
        return this.renderTwoCol();
    }
  }
}