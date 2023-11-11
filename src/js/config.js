jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

  var $form = $('.js-submit-settings');
  var $cancelButton = $('.js-cancel-button');
  // var $viewId = $('.js-view-id');
  var $viewNameCheckBox = $('.view-name-checkbox');
  var $fieldSelect = $('#field-select');
  if (!($form.length > 0 && $cancelButton.length > 0)) {
    throw new Error('Required elements do not exist.');
  }
  var config = kintone.plugin.app.getConfig(PLUGIN_ID);

  //configが空のときオブジェクトを作成
  if(config.view === undefined) {
    config = {view: '', field: '作成日時'};
  }

  var selectedViews = selectedViews = config.view.split(',');
  console.log(config.view);

  //すべてのビューをチェックする
  if(selectedViews.indexOf('（すべて）') !== -1) {
    document.getElementById('all').checked = 'checked';
  }
  // console.log(config.view);

  //プラグインを適用する一覧を選択するチェックボックスを設置
  kintone.api(kintone.api.url('/k/v1/app/views.json', true), 'GET', {app: kintone.app.getId()})
    .then((resp) => {
      // console.log(views);
      Object.keys(resp.views).forEach((view, index) => {
        // console.log(index, view);

        //一覧のチェックボックスを動的に作成
        var checkBox = document.createElement('div');
        checkBox.className = 'kintoneplugin-input-checkbox';
        var checkItem = document.createElement('span');
        checkItem.className = 'kintoneplugin-input-checkbox-item';
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.id = 'view-check-' + index;
        input.value = view;
        input.name = 'checkbox';
        
        //初期値設定
        selectedViews.forEach((configView, i) => {
          if (configView === view) {
            input.checked = 'checked';
          }
        });
        var label = document.createElement('label');
        label.textContent = view;
        label.htmlFor = 'view-check-' + index;
        checkItem.append(input);
        checkItem.append(label);
        checkBox.append(checkItem);
        $viewNameCheckBox.append(checkBox);
      });
    });

  //フィールド選択のドロップダウンを設置
  kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', {app: kintone.app.getId()})
    .then((resp) => {
      // console.log(resp.properties);
      Object.keys(resp.properties).forEach((key, index) => {
        var fieldType = resp.properties[key].type; //フィールドタイプ
        var fieldLabel = resp.properties[key].label; //フィールド名
        var fieldCode = resp.properties[key].code; //フィールドID
        if (fieldType === 'CREATED_TIME' || fieldType === 'DATE' || fieldType === 'UPDATED_TIME'|| fieldType === 'DATETIME') {
          // console.log(index, fieldLabel);

          //一覧のチェックボックスを動的に作成
          var dropdownOption = document.createElement('option');
          dropdownOption.value = fieldLabel;
          dropdownOption.textContent = fieldLabel;
          dropdownOption.id = fieldCode;
          // console.log(dropdownOption.Id);
          //初期値設定
          if (config.fieldCode === fieldCode) {
            dropdownOption.selected = 'selected';
          }
          $fieldSelect.append(dropdownOption);
        }
      });
    });

  //保存が押されたとき
  $form.on('submit', function(e) {
    e.preventDefault();

    //ビューが複数個チェックされたとき配列化する
    var selectedViews = [];
    $('input[name="checkbox"]:checked').each(function() {
      selectedViews.push( $(this).val() );
    });
    if(selectedViews.length >= 2){
      var selectedView = selectedViews.join(','); //配列→文字列
    }else if(selectedViews.length === 1){
      selectedView = selectedViews[0];
    }else{
      selectedView = '';
    }
    console.log(selectedView);
    
    //ドロップダウンで選択されたフィールド名を取得
    var selectedFieldName = $("#field-select").children("option:selected").text();

    //ドロップダウンで選択されたフィールドコードを取得
    var selectedFieldCode = $("#field-select").children("option:selected").attr('id');

    console.log(selectedFieldCode);
    console.log(selectedFieldName);

    //configのオブジェクトを設定する
    kintone.plugin.app.setConfig({
      view: selectedView,
      fieldName: selectedFieldName,
      fieldCode: selectedFieldCode
    }, function() {
      // alert('The plug-in settings have been saved. Please update the app!');
      window.location.href = '../../flow?app=' + kintone.app.getId();
    });
  });
  $cancelButton.on('click', function() {
    window.location.href = '../../' + kintone.app.getId() + '/plugin/';
  });
})(jQuery, kintone.$PLUGIN_ID);
