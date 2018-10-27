/* eslint-disable */

import React, { Component } from 'react';
import { connect } from 'dva';
import { remove, findIndex, last } from 'lodash';
import { flowchartStatus, flowchartStatusColor } from '../../utils/convert'
import { userStorage } from '../../utils/util'
const curveRadius = 4;
const colGap = 12;
const verticalRate = 30;
const lineStyle = {
  color: 'rgb(202,233,233)',
  width: 2,
};
const firstColLineStyle = {
  color: 'rgb(202,233,233)',
  width: 2,
}
const node = {
  radius: 5,
  color: 'rgb(89,195,195)',
  width: 2
}

// const test = [
//   { id: 1, time: '1', next_id: [2, 3, 4], prev_id: [] },
//   { id: 2, time: '2', next_id: [8], prev_id: [1] },
//   { id: 3, time: '3', next_id: [5, 6], prev_id: [1] },
//   { id: 4, time: '4', next_id: [8], prev_id: [1] },
//   { id: 5, time: '5', next_id: [7], prev_id: [3] },
//   { id: 6, time: '6', next_id: [7], prev_id: [3] },
//   { id: 7, time: '7', next_id: [8], prev_id: [5, 6] },
//   { id: 8, time: '8', next_id: [9, 10], prev_id: [2, 4, 7] },
//   { id: 9, time: '9', next_id: [11], prev_id: [8] },
//   { id: 10, time: '10', next_id: [11], prev_id: [8] },
//   { id: 11, time: '11', next_id: [12, 13], prev_id: [9, 10] },
//   { id: 12, time: '9', next_id: [14], prev_id: [11] },
//   { id: 13, time: '10', next_id: [14], prev_id: [11] },
//   { id: 14, time: '11', next_id: [], prev_id: [12, 13] },
// ];

// const test = [
//   { id: 1, time: '1', next_id: [2, 3, 4], prev_id: [] },
//   { id: 2, time: '2', next_id: [5], prev_id: [1] },
//   { id: 3, time: '3', next_id: [5], prev_id: [1] },
//   { id: 4, time: '4', next_id: [6], prev_id: [1] },
//   { id: 5, time: '5', next_id: [6], prev_id: [2, 3] },
//   { id: 6, time: '6', next_id: [], prev_id: [4, 5] },
// ];
// const test = [
//   { id: 1, time: '2', next_id: [2], prev_id: [] },
//   { id: 2, time: '2', next_id: [3], prev_id: [1] },
//   { id: 3, time: '2', next_id: [4], prev_id: [2] },
//   { id: 4, next_id: [], prev_id: [3] }
// ]
const test = [
  { id: 1, time: '1', next_id: [2, 3, 4], prev_id: [], status: 1, approver: 'xx', operate_at: 'xx', 'staff_sn': 'xxx' },
  { id: 2, time: '2', next_id: [5, 6], prev_id: [1] },
  { id: 3, time: '3', next_id: [7, 8], prev_id: [1] },
  { id: 4, time: '4', next_id: [9, 10], prev_id: [1] },
  { id: 5, time: '5', next_id: [12], prev_id: [2] },
  { id: 6, time: '6', next_id: [11], prev_id: [2] },
  { id: 7, time: '6', next_id: [13], prev_id: [3] },
  { id: 8, time: '6', next_id: [11], prev_id: [3] },
  { id: 9, time: '6', next_id: [], prev_id: [4] },
  { id: 10, time: '6', next_id: [11], prev_id: [4] },
  { id: 11, time: '6', next_id: [13], prev_id: [6, 8, 10] },
  { id: 12, time: '6', next_id: [13], prev_id: [5] },
  { id: 13, time: '6', next_id: [], prev_id: [12, 11, 7] },
];
let datas = [];
let cols = {};
let testKeyById = {};
let lines = [];
let rows = [];
let uniqueRows = [];
let curves = [];
const unfinishedLines = [];
@connect()
export default class FlowChart extends Component {
  constructor(props) {
    super(props);
    const { dataSource } = props;
    this.state = {
      chartData: [],
      lines: [],
      rows: [],
      cols: {},
      uniqueRows: [],
    }

    if (dataSource.length) {
      this.makeChartData(props.dataSource)
    }
  }

  componentWillReceiveProps(props) {
    const { dataSource = [] } = props;
    if (JSON.stringify(dataSource || []) !== JSON.stringify(this.props.dataSource || []) && dataSource && dataSource.length) {
      if (dataSource.length) {
        this.makeChartData(dataSource)
      }
    }
  }

  componentDidMount() {
    this.canvas = document.getElementById('myCanvas');
    this.ctx = this.canvas.getContext('2d');
    const { dataSource } = this.props;
    if (dataSource.length) {
      this.makeChartData(dataSource)
    }
  }

  makeChartData = (dataSource) => {
    cols = {};
    testKeyById = {};
    lines = [];
    rows = [];
    uniqueRows = [];
    curves = [];
    datas = [...dataSource]
    // datas = [...test]
    datas.forEach((step, index) => {
      testKeyById[step.id] = step;
      step.y = index + 1;
      //绑定点的X坐标
      if (step.prev_id.length === 0) {//主节点
        const firstLine = this.createNewColLine(cols, '0.');
        const row = this.createNewRowLine('0.', '0.', step.y + 0.5);
        step.row = row;
        step.line = firstLine;
        // step.unfinishedLines = [...unfinishedLines];
      } else if (step.prev_id.length > 1) {//合并
        const prevSteps = datas.filter(item => step.prev_id.indexOf(item.id) !== -1);
        let max = '0';
        let min = '1';
        prevSteps.forEach((prevStep) => {
          const { colIndex } = prevStep.line;
          this.finishColLine(prevStep.line, step.y - 0.5); //上一条线的结束点
          max = colIndex - max >= 0 ? colIndex : max;
          min = colIndex - min <= 0 ? colIndex : min;
        });
        const row = this.createNewRowLine(min, max, step.y - 0.5);
        step.row = row;
        unfinishedLines.forEach((line) => {//交叉
          if (line.colIndex > min && line.colIndex < max) {
            line.crossingPoint.push(step.y - 0.5);//交叉点
          }
        });
        const prevLines = prevSteps.map(item => item.line);
        const basicLine = this.findBasicLine(prevLines);
        const newLine = this.createNewColLine(basicLine.col, basicLine.colIndex, step.y - 0.5, prevLines);
        step.line = newLine;
        // step.unfinishedLines = [...unfinishedLines];
      } else {//不分叉
        const prevStep = testKeyById[step.prev_id[0]];
        let max = '0';
        let min = '1';
        if (prevStep.next_id.length > 1) {
          const subIndex = prevStep.next_id.indexOf(step.id);
          prevStep.next_id.forEach((next, i) => {
            const colIndex = `${prevStep.line.colIndex}${i >= 10 ? i : `0${i}`}`;
            max = colIndex - max >= 0 ? colIndex : max;
            min = colIndex - min <= 0 ? colIndex : min;
          })
          const newLine = prevStep.line.next_id[subIndex];
          const row = this.createNewRowLine(min, max, prevStep.y + 0.5);
          step.line = newLine;
          step.row = row;
          // step.unfinishedLines = [...unfinishedLines];
        } else {
          const { row: { start, end } } = prevStep;
          const row = this.createNewRowLine(start, end, step.y + 0.5);
          step.row = row;
          step.line = prevStep.line;
          // step.unfinishedLines = [...unfinishedLines];
        }
      }
      step.unfinishedLines = [...unfinishedLines];
      // 生成cols分支
      if (step.next_id.length > 1) {
        this.separateColLine(step, step.y + 0.5)
      }
      if (step.next_id.length === 0) {
        this.finishColLine(step.line, step.y);
      }
    });
    const maxIndex = this.fillColsIndex(cols);
    console.log('test:', datas);
    console.log('cols:', cols);
    console.log('lines:', lines);
    console.log('rows:', rows);
    const endPoint = last(datas);
    const { y } = endPoint;
    if (this.canvas) {
      this.canvas.height = (y + 0.5) * verticalRate + 40;
      this.canvas.width = maxIndex * colGap + 20;
    }
    this.drawRect(0, 0, (maxIndex + 1) * colGap + 20, (y + 0.5) * verticalRate + 40)
    this.recombineRows();
    this.setState({
      chartData: [...datas],
      lines: [...lines],
      rows: [...rows],
      uniqueRows: [...uniqueRows],
      cols: { ...cols },
      curves: [...curves]
    }, () => {
      this.draw();
    })
  }
  createNewRowLine = (min, max, y) => {
    const row = { start: min, end: max, y };
    rows.push(row);
    return row;
  }

  createNewColLine = (col, colIndex, start = 1, prev_id = []) => {
    const line = { col, colIndex, start, end: '', prev_id, next_id: [], crossingPoint: [] };
    lines.push(line);
    prev_id.forEach((prevLine) => {
      prevLine.next_id.push(line);
    });
    this.sortUnfinishedLines(line);
    return line;
  }

  sortUnfinishedLines = (line) => {
    const index = findIndex(unfinishedLines, (item) => {
      return item.colIndex > line.colIndex
    });
    unfinishedLines.splice(index === -1 ? unfinishedLines.length : index, 0, line);
  }

  /**
   * 生成线分支
   */
  separateColLine = (prevStep, startY) => {
    const prevLine = prevStep.line;
    this.finishColLine(prevLine, startY);
    prevStep.next_id.forEach((next, subIndex) => {
      const col = prevLine.col[subIndex] = prevLine.col[subIndex] || {};
      const colIndex = `${prevLine.colIndex}${subIndex >= 10 ? subIndex : `0${subIndex}`}`;
      this.createNewColLine(col, colIndex, startY, [prevLine]);
    });
  }

  findBasicLine = (prevLines) => {
    const basicLines = this.findBasicLines({ prev_id: prevLines });
    let response = basicLines.shift();
    basicLines.forEach((basicLine) => {
      response = basicLine.colIndex - response.colIndex >= 0 ? response : basicLine;
    });
    return response;
  }

  findBasicLines = (line, basicLines = []) => {
    const prevLines = line.prev_id;
    if (prevLines.length === 0) {
      basicLines.push(line);
    } else if (prevLines.length > 1) {
      prevLines.forEach((prevLine) => {
        basicLines = this.findBasicLines(prevLine, basicLines);
      });
    } else if (prevLines.length === 1) {
      const prevLine = prevLines[0];
      if (prevLine.next_id.length === 1) {
        basicLines = this.findBasicLines(prevLine, basicLines);
      } else if (prevLine.next_id.length > 1) {
        let prevNextLine;
        let flag = true;
        const newBasicLines = [...basicLines];
        for (let i = 0; i < prevLine.next_id.length; i += 1) {
          prevNextLine = prevLine.next_id[i];
          if (basicLines.indexOf(prevNextLine) === -1 && prevNextLine !== line) {
            basicLines.push(line);
            flag = false;
            break;
          }
          remove(newBasicLines, (item => item === prevNextLine));
        }
        if (flag) {
          basicLines = this.findBasicLines(prevLine, newBasicLines);
        }
      }
    }
    return basicLines;
  }

  finishColLine = (line, endY) => {
    line.end = endY;
    remove(unfinishedLines, item => item === line);
    return line;
  }

  maxColIndex(indexGroup) {
    let max = '0';
    indexGroup.forEach((colIndex) => {
      max = colIndex - max >= 0 ? colIndex : max;
    });
  }

  minColIndex(indexGroup) {
    let min = '1';
    indexGroup.forEach((colIndex) => {
      min = colIndex - min <= 0 ? colIndex : min;
    });
  }

  fillColsIndex = (cols, colIndex = 1) => {
    const index = colIndex;
    Object.keys(cols).forEach((key) => {
      if (key > 0) colIndex += 1;
      colIndex = this.fillColsIndex(cols[key], colIndex);
    });
    cols.index = index;
    return colIndex;
  }

  recombineRows = () => {//uniqueRows
    let obj = {};
    rows.forEach(row => {
      const { start, end, y } = row;
      const [newStartLine] = lines.filter(item => item.colIndex === start);
      const [newEndLine] = lines.filter(item => item.colIndex === end);
      const newStart = newStartLine.col.index;
      const newEnd = newEndLine.col.index;
      row.start = newStart;
      row.end = newEnd;
      if (newStart !== newEnd) {
        obj[y] = []
      }
    })
    rows.forEach(row => {
      const { start, end, y } = row;
      if (start !== end) {
        obj[y].push({ start, end, y });
      }
    })
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      let min = value[0].start;
      let max = value[0].end;
      value.slice(1).forEach(item => {
        const { start, end } = item;
        min = start - min <= 0 ? start : min;
        max = end - max > 0 ? end : max;
      })
      uniqueRows.push({ start: min, end: max, y: key });
      this.makeCurves(min, max, key)
    })
  }

  makeCurves = (start, end, y) => {//curves 
    const startPoint = { x: start, y };
    const line = lines.filter(line => (`${line.col.index}` === `${end}` && (`${y}` === `${line.start}` || `${y}` === `${line.end}`)));
    const endPoint = { x: end, y: line[0].end };
    let p1 = { x: end - (curveRadius / colGap), y };
    let p2 = { x: end, y: y - 0 + (curveRadius / verticalRate) };
    let direction = 1;
    if ((startPoint.x - endPoint.x) * (startPoint.y - endPoint.y) <= 0) {
      p1 = { x: end - (curveRadius / colGap), y };
      p2 = { x: end, y: y - (curveRadius / verticalRate) };
      direction = -1;
    }
    curves.push({ start: p1, end: p2, direction });
  }


  drawRect = (x, y, w, h) => {
    if (this.canvas) {
      const { ctx } = this;
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x, y, w, h);
    }
  }

  drawLine = (x1, y1, x2, y2, color, width = lineStyle.width) => {
    if (this.canvas) {
      const { ctx } = this;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  drawArc = (x, y, r, sAngle = 0, eAngle = 2 * Math.PI, color, counterclockwise = false, fill = true, width = lineStyle.width) => {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    // ctx.closePath();
    if (fill) {
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.fill();
    }
    else {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  drawText = (str, x, y) => {
    if (this.canvas) {
      const { ctx } = this;
      ctx.font = '12px Georgia';
      ctx.fillStyle = 'red';
      ctx.fillText(str, x, y);
    }
  }

  drawCrossPoint = (crossingPoint, index, c1, c2) => {
    crossingPoint.forEach(point => {
      this.drawArc((index * colGap) - 1, point * verticalRate, 5, -0.5 * Math.PI, 0.5 * Math.PI, c1);
      this.drawArc((index * colGap) - 1, point * verticalRate, 3, -0.5 * Math.PI, 0.5 * Math.PI, c2);
    })
  }

  drawRing = (x, y, r1, r2, c1, c2) => {
    this.drawArc(x, y, r1, 0, 2 * Math.PI, c1);
    this.drawArc(x, y, r2, 0, 2 * Math.PI, c2);
  }

  drawGeneralArc = (x, y, r, color) => {
    this.drawArc(x, y, r, 0, 2 * Math.PI, color, false)
  }

  drawCurve = (x1, y1, x2, y2, direction, r = curveRadius) => {
    let c = { x: x1, y: y1 - 0 + (r / verticalRate) };
    if (direction < 0) {
      c = { x: x1, y: y1 - (r / verticalRate) };
    }
    this.drawLine(x1 * colGap, y1 * verticalRate, x2 * colGap, y1 * verticalRate, '#fff');
    this.drawLine(x2 * colGap, y1 * verticalRate, x2 * colGap, y2 * verticalRate, '#fff');
    this.drawArc(c.x * colGap, c.y * verticalRate, r, 0, direction > 0 ? -0.5 * Math.PI : 0.5 * Math.PI, lineStyle.color, !!(direction > 0), false);
  }

  draw = () => {
    const { uniqueRows, chartData, lines, curves } = this.state
    uniqueRows.forEach((row) => {
      const { start, end, y } = row;
      this.drawLine(start * colGap, y * verticalRate, end * colGap, y * verticalRate, lineStyle.color);
    })
    lines.forEach((line, i) => {
      const { col: { index }, start, end, crossingPoint } = line;
      const color = index === 1 ? firstColLineStyle.color : lineStyle.color;
      this.drawLine(index * colGap, start * verticalRate, index * colGap, end * verticalRate, color);
      if (crossingPoint.length) {
        this.drawCrossPoint(crossingPoint, index, lineStyle.color, '#fff');
      }
    })
    chartData.forEach((point) => {
      const { line: { col: { index } }, y } = point;
      if (y === 1) {
        this.drawRing(index * colGap, y * verticalRate, node.radius, node.radius - 1, node.color, '#fff');
      }
      else {
        const color = `${point.action_type}` === '0' ? 'rgb(245,166,35)' : node.color
        this.drawGeneralArc(index * colGap, y * verticalRate, node.radius, color)
      }
    });
    curves.forEach((p) => {
      const { start, end, direction } = p;
      this.drawCurve(start.x, start.y, end.x, end.y, direction)
    })
  }

  renderTimeLine = () => {
    const { chartData } = this.state;
    const timelines = chartData.map(line => {
      const { unfinishedLines = [], y, id, } = line;
      const lastLines = last(unfinishedLines)
      const maxColIndex = lastLines ? lastLines.col.index : 0;
      const style = {
        position: 'absolute',
        left: maxColIndex * colGap + 14 + 6,
        right: 15,
        top: y * verticalRate - 11,
        height: '22px', lineHeight: '22px',
        display: 'flex',
        justifyContent: 'space-between',
      }
      const fisrtDivStyle = {
        fontSize: '14px',
        color: 'rgb(102,102,102)'
      }
      const timeStyle = {
        fontSize: '12px',
        color: 'rgb(136,136,136)',
      }
      const statusMsg = flowchartStatus(line.action_type);
      const optater = line.approver_sn == userStorage('userInfo').staff_sn ? '我' : line.approver_name;
      const statusColor = flowchartStatusColor(line.action_type)
      return (
        <div style={{ ...style, background: '#fff' }} key={id} >
          <div>
            <span style={{ ...fisrtDivStyle }}>{optater}</span>
            <span style={{ ...fisrtDivStyle, marginLeft: '10px', color: statusColor }}>{statusMsg}</span>
          </div>
          <div style={{ ...timeStyle }} >{line.acted_at}</div>
        </div>
      )
    })
    return timelines
  }

  render() {
    const { chartData } = this.state;
    return (
      <div style={{ background: '#fff', position: 'relative', paddingLeft: '6px' }}>
        <canvas id="myCanvas" width="300" height="600" />
        {chartData.length &&
          this.renderTimeLine()}
      </div>
    );
  }
}

FlowChart.defaultProps = {
  dataSource: []
}