jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

  kintone.events.on('app.record.index.show', (e) => {
    //設定値を取得
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);

    //ビューが設定されていない場合検索フォームを非表示にする
    if(config.view === undefined) return;

    var viewArray = config.view.split(',');    
    if (viewArray.indexOf(e.viewName) == -1) return e;

    //すでに検索ボックスが設置されているときreturnする
    console.log($('.day-search-span').length);
    if ($('.day-search-span').length !== 0) return e;


    //ヘッダースペースを取得
    // var spaceElement = document.getElementsByClassName('kintone-app-headermenu-space');
    var spaceElement = kintone.app.getHeaderMenuSpaceElement();
    spaceElement.selectMenu;
    if (spaceElement === null) {
      throw new Error('The header element is unavailable on this page');
    }

    settingForm(spaceElement, config.fieldName); //フォームを設置（設置する場所, 左に表示するフィールド名）
    setValue($, config); //値をセット
    
    //検索ボタンが押されたとき
    $('.search-button').click(function() {
      searchDate($, e, config) //検索
    });

    //現在のクエリ確認
    var query = kintone.app.getQueryCondition();
    console.log(query);

  });
})(jQuery, kintone.$PLUGIN_ID);

//フォーム設置
function settingForm(spaceElement, fieldName) {
  //フォーム親要素を指定
  var daySearchForm = document.createElement('span');
  daySearchForm.className = 'day-search-span';
  daySearchForm.style = 'margin: 0 5px 0 0; padding: 10px; border: 1px solid; border-color: #E4E8DF; background-color: #F7F9FA; color: #848692'
  
  //開始日の入力フォームを設置
  var startCalender = document.createElement('input');
  startCalender.type = 'date';
  startCalender.className = 'start-date';
  startCalender.style = 'height:30px; border: 1px solid; border-color: #E4E8DF;';
  
  //終了日の入力フォームを設置
  var endCalender = document.createElement('input');
  endCalender.type = 'date';
  endCalender.className = 'end-date';
  endCalender.style = 'height:30px; border: 1px solid; border-color: #E4E8DF;';

  //検索ボタン
  var searchButton = document.createElement('input');
  searchButton.type = 'submit';
  searchButton.value = '検索';
  searchButton.className = 'search-button';
  searchButton.style = 'height: 30px; margin-left: 5px; background: #3498DB; color: white; border: none; border-radius: 10%';

  //フォームを設置
  daySearchForm.append(fieldName + ': ');
  daySearchForm.append(startCalender);
  daySearchForm.append(' ~ ');
  daySearchForm.append(endCalender);
  daySearchForm.append(searchButton);
  spaceElement.append(daySearchForm);
}

//値をセット
function setValue($, config) {
  fieldCode = config.fieldCode;
  const today = new Date();
  var startDate = getStringFromDate(today);
  var endDate = getStringFromDate(today);

  //現在のクエリの日付を取得
  var query = kintone.app.getQueryCondition(); //現在のクエリ文字列を取得
  var regexStart = new RegExp(`${fieldCode} >= "[0-9]{4}-[0-9]{2}-[0-9]{2}"`); //開始日の正規表現
  var regexEnd = new RegExp(`${fieldCode} < "[0-9]{4}-[0-9]{2}-[0-9]{2}"`); //終了日の正規表現
  if(regexStart.test(query)){
    startDate = query.match(regexStart)[0].match(/"(.+)"/g)[0].replace(/"/g, '');
  }
  if(regexEnd.test(query)){
    endDate = query.match(regexEnd)[0].match(/"(.+)"/g)[0].replace(/"/g, '');
    endDate = addDate(new Date(endDate), -1); //日付を-1日する
  }

  $('.start-date').val(startDate);
  $('.end-date').val(endDate);
}

//日付型を文字列型に変換
function getStringFromDate(d) {
  const yearStr = d.getFullYear();
  const monthStr = d.getMonth() + 1;
  const dayStr = d.getDate();
  
  let formatStr = 'YYYY-MM-DD';
  formatStr = formatStr.replace(/YYYY/g, yearStr);
  formatStr = formatStr.replace(/MM/g, String(monthStr).padStart(2,'0'));
  formatStr = formatStr.replace(/DD/g, String(dayStr).padStart(2,'0'));
  
  return formatStr;
}

//検索
function searchDate($, e, config) {
  const startDate = $('.start-date').val();
  const endDate = addDate($('.end-date').val(), 1); //日付を1日プラスする

  var fieldCode = config.fieldCode; //対象のフィールドを宣言

  //URLを作成
  const viewpath = '?view=' + e.viewId;
  const query = createQueryString(startDate, endDate, fieldCode); //引数として開始日、終了日、フィールドコードを渡す
  document.location = location.origin + location.pathname + viewpath + encodeURI(query);
}

// クエリ文字列生成
const createQueryString = (startDate, endDate, fieldCode) => {  
  var query = kintone.app.getQueryCondition(); //現在のクエリ文字列を取得
  var regexStart = new RegExp(`${fieldCode} >= "[0-9]{4}-[0-9]{2}-[0-9]{2}"`); //開始日の正規表現
  var regexEnd = new RegExp(`${fieldCode} < "[0-9]{4}-[0-9]{2}-[0-9]{2}"`); //終了日の正規表現

  if (query === ''){ //現在クエリが未指定の時
    query = fieldCode +' >= "' + startDate + '" and ' + fieldCode +' < "'+ endDate + '"'; //開始日と終了日を設定する
  }else if(regexStart.test(query) && regexEnd.test(query)){
    query = query.replace(regexStart, fieldCode + '>= "' + startDate + '"'); // 開始日を変更
    query = query.replace(regexEnd, fieldCode + '< "' + endDate + '"'); // 終了日を変更
  }else if(regexStart.test(query)) {
    query = query.replace(regexStart, fieldCode + '>= "' + startDate + '"'); // 開始日を変更
    query = query + ' and ' + fieldCode +' < "'+ endDate + '"'; //終了日を追加
  }else if(regexEnd.test(query)){
    query = query + ' and ' + fieldCode +' >= "' + startDate + '"'; //開始日を追加
    query = query.replace(regexEnd, fieldCode + '< "' + endDate + '"'); // 終了日を変更
  }else{
    query = query + ' and ' + fieldCode +' >= "' + startDate + '" and ' + fieldCode +' < "'+ endDate + '"'; //既存のクエリに開始日と終了日を追加する
  }
  return '&query=' + query;
};

//日付データにn日加算する
function addDate(dateValue, n) {
  var date = new Date(dateValue);
  date.setDate(date.getDate() + n);
  var year = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd = date.getDate().toString();
  var yyyymmdd = year + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
  return yyyymmdd;
}
