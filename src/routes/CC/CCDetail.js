// 审批的表单
import React, { Component } from 'react';
import { connect } from 'dva';
import { FormDetail } from '../../components';
import spin from '../../components/General/Loader';
import CCPerson from '../../components/CCPerson';
import { makeGridItemData } from '../../utils/util';

import FlowChart from '../../components/FlowChart/chart';

import style from '../TableEdit/index.less';
import styles from '../common.less';

class CCDetail extends Component {
  componentWillMount() {
    const { match: { params }, ccperson: { startflow } } = this.props;
    const { id } = params;
    if (startflow) {
      if (Object.keys(startflow).length && (`${startflow.id}` !== `${id}`)) {
        this.fetchDetail(id);
      }
    } else {
      this.fetchDetail(id);
    }
  }

  getGridItem = (key) => {
    const { ccperson: { gridformdata, startflow } } = this.props;
    const { fields: { grid } } = startflow;
    const [gridItem] = (grid || []).filter(item => `${item.key}` === `${key}`);
    const [currentGridData] = (gridformdata || []).filter(item => `${item.key}` === `${key}`);
    const dataList = makeGridItemData(currentGridData, gridItem);
    return dataList.map((item, i) => {
      const idx = i;
      return (
        <div
          key={idx}
          className={style.grid_list_item}
          onClick={() => this.toEditGrid(`/cc_grid/${key}/${i}`)}
        >
          {item.value_0 && <div className={style.main_info}>{item.value_0}</div>}
          {item.value_1 && <div className={style.desc}>{item.value_1}</div>}
          {item.value_2 && <div className={style.desc}>{item.value_2}</div>}
        </div>
      );
    });
  }

  getGridList = () => {
    const { ccperson } = this.props;
    const { startflow } = ccperson;
    const { fields: { grid } } = startflow;
    const formdata = startflow.form_data;
    const validGrid = [];
    grid.forEach((item) => {
      const { key } = item;
      const value = formdata[key];
      if (!value || (value.length)) {
        validGrid.push(item);
      }
    });
    return validGrid.map((item, i) => {
      const idx = i;
      return (
        <div key={idx} className={style.grid_item}>
          <p className={style.grid_opt}>
            <span>{item.name}</span>
          </p>
          {this.getGridItem(item.key)}
        </div>
      );
    });
  }

  fetchDetail = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ccperson/getCCDetail',
      payload: {
        id,
        cb: (detail) => {
          dispatch({
            type: 'start/getFlowChart',
            payload: { id: detail.step_run_id },
          });
        },
      },
    });
  }

  toEditGrid = (url) => {
    const { history } = this.props;
    history.push(url);
  }

  render() {
    const { ccperson, loading, start } = this.props;
    const { startflow } = ccperson;
    const { flowChart } = start;
    const formData = ccperson.form_data;
    spin(loading);
    if (!startflow) return null;
    const { fields: { form } } = startflow;
    const cc = startflow.cc_person;

    // 只需要展示的（不包括可编辑的）
    const availableForm = form.filter(item =>
      startflow.step.available_fields.indexOf(item.key) !== -1);
    const showForm =
      availableForm.filter(item => startflow.step.hidden_fields.indexOf(item.key) === -1);
    // 可编辑的

    return (
      <div className={styles.con}>
        <div className={styles.con_content}>
          <FormDetail
            form_data={formData}
            show_form={showForm}
            history={this.props.history}
          />
          {this.getGridList()}
          <CCPerson cc={cc} />
          <div style={{ marginBottom: '20px' }}>
            <p className={style.grid_opt}>审批进程</p>
            <FlowChart dataSource={flowChart} />
          </div>
        </div>

      </div>
    );
  }
}
export default connect(({
  start, loading, ccperson,
}) => {
  return ({
    ccperson,
    start,
    loading: (
      // (loading.effects['start/doWithDraw'] || false) ||
      // (loading.effects['api/fetchApi'] || false) ||
      // (loading.effects['start/getStartFlow'] || false) ||
      // (loading.effects['approve/getFlowChart'] || false)
      loading.global
    ),
  });
})(CCDetail);