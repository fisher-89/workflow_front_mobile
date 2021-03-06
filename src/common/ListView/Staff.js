import React, { Component } from 'react';
import ListView from '../../components/ListView';
import { Label } from '../../components/General';
import { reverseStaffState } from '../../utils/convert';
import style from './index.less';

@ListView
export default class Staff extends Component {
  render() {
    const { value, onClick, checked, multiple, renderName = 'realname', isFinal = false } = this.props;
    // const className = [style.item, checked ?
    // (multiple ? style.checked : style.single_item) : null].join(' ');
    const className = [style.item, multiple ? null : style.single, checked ? (multiple ? style.checked : style.single_item) : null].join(' ');

    return (
      <div
        onClick={() => onClick(value)}
        className={style.action_item}
      >
        <div
          // {...className}
          className={className}
        >
          <div className={style.baseinfo}>
            <Label
              content={reverseStaffState(value.status_id)}
              styles={{
            borderRadius: '0.05333rem',
            margin: 0,
            marginRight: '10px',
           }}
            />
            <span>{value[renderName]}</span>
            <span style={{ color: '#969696', fontSize: '12px' }}>
              {value && value.department ? `（${value.department.full_name}）` : ''}
            </span>
          </div>
        </div>

        {isFinal ? (
          <React.Fragment>
            <div className={style.brief}>
              <span>A分权限：{(value.point_a_deducting_limit ? `-${value.point_a_deducting_limit}` : '0')} 至 {value.point_a_awarding_limit}</span>
            </div>
            <div className={style.brief}>
              <span>B分权限：{(value.point_b_deducting_limit ? `-${value.point_b_deducting_limit}` : '0')} 至 {value.point_b_awarding_limit}</span>
            </div>
          </React.Fragment>
        ) : null}

      </div>
    );
  }
}
Staff.defaultProps = {
  multiple: false,
};
