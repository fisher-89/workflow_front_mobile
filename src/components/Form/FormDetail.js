import React, {
  Component,
} from 'react';
import { List } from 'antd-mobile';
import {
  connect,
} from 'dva';
import { dealThumbImg } from '../../utils/convert';
import { SelectComp, SelectCheckbox, Region, TextInput, Upload, FormArray, FormApi, FormDate } from '../FormType';
import style from '../FormType/index.less';

class FormDetail extends Component {
  state = {
    showGrid: [], // 显示的列表控件
  }

  // 生成表单
  getFormList = () => {
    const showForm = this.props.show_form;
    const formData = this.props.form_data;
    return showForm.map((item, i) => {
      const idx = i;
      if (item.type === 'region') {
        return (
          <Region
            key={idx}
            field={item}
            isEdit={false}
            defaultValue={formData[item.key]}
          />
        );
      }
      if (item.type === 'department' || item.type === 'staff' || item.type === 'shop') {
        return (
          <SelectComp
            isEdit={false}
            field={item}
            defaultValue={formData[item.key]}
            key={idx}
          />
        );
      }
      if (item.type === 'api') {
        return (
          <FormApi
            isEdit={false}
            field={item}
            defaultValue={formData[item.key]}
            key={idx}
          />);
      }
      if (item.type === 'file') { // 文件
        const files = (formData[item.key] || []).map((its) => { return { url: dealThumbImg(`${UPLOAD_PATH}${its}`, '_thumb') }; });
        const { history } = this.props;
        return (
          <Upload
            history={history}
            field={item}
            key={idx}
            isEdit={false}
            data={files}
          />
        );
      } else if (item.type === 'array') {
        return (
          <FormArray
            key={idx}
            field={item}
            isEdit={false}
            defaultValue={formData[item.key]}
          />
        );
      } else if (item.type === 'select') { // 数组
        // const reg = /^\[|\]$/g;
        const options = (item.options || []).map((its) => {
          const obj = {};
          obj.label = its;
          obj.value = its;
          return obj;
        });
        return (
          <SelectCheckbox
            key={idx}
            field={item}
            isEdit={false}
            defaultValue={formData[item.key]}
            options={options}
          />
        );
      } else if (item.type === 'datetime' || item.type === 'date' || item.type === 'time') {
        return (
          <FormDate
            key={idx}
            field={item}
            isEdit={false}
            defaultValue={formData[item.key]}
          />
        );
      }
      return (
        <TextInput
          defaultValue={formData[item.key]}
          key={idx}
          field={item}
          isEdit={false}
        />
      );
    });
  }

  getGridList = () => {
    const {
      showGrid,
    } = this.state;
    showGrid.map((item) => {
      return (
        <List
          renderHeader={() => item.name}
          key={item.key}
        >
          {this.getGridListField(item)}
        </List>
      );
    });
  }

  render() {
    return (
      <div className={[style.form, style.form_detail].join(' ')}>
        <List >
          {this.getFormList()}
        </List>

      </div>
    );
  }
}
export default connect(({
  loading,
}) => ({
  loading,
}))(FormDetail);
