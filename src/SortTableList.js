/**
 * Created by lijun on 2016/11/16.
 */
// import Sortable from 'sortablejs';
import Sortable from './Sortable';
import { insertBeforeSibling, timeout, handleTr } from './util';
// http://stackoverflow.com/questions/40755515/drag-element-dynamicly-doesnt-work-in-firefox
// 这个问题解决不了，所以只能采取table加载完就开始创建sortable的方法
export default class SortTableList {
  constructor({ tables = [], originTable }) {
    for (const fn of Object.getOwnPropertyNames((Object.getPrototypeOf(this)))) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }

    this.tables = tables;

    this.el = tables.reduce((previous, current) => {
      const li = document.createElement('li');
      li.appendChild(current.el);
      return previous.appendChild(li) && previous;
    }, document.createElement('ul'));
    this.el.classList.add('sindu_sortable_table');
    this.el.style.position = 'fixed';
    insertBeforeSibling({ target: this.el, origin: originTable.el });

    Sortable.create(this.el, {
      animation: 150,
      onChoose: () => {
        this.el.parentNode.classList.add('sindu_dragging');
      },
      onEnd: (evt) => {
        this._onDrop({ from: evt.oldIndex, to: evt.newIndex });
      },
    });

    this.originTable = originTable;
    this._renderTables();
    window.addEventListener('resize', () => {
      (async() => {
        await timeout(66);
        this._renderTables();
      })();
    }, false);
  }

  _onDrop({ from, to }) {
    this.el.parentNode.classList.remove('sindu_dragging');
    this.originTable.onSortTableDrop({ from, to });
  }


  _renderTables() {
    // 重新计算每一列的宽度
    Array.from(this.originTable.movingRow.children).forEach(
      (td, index) => {
        this.tables[index].el.style.width = `${td.getBoundingClientRect().width}px`;
      }
    );

    // 重新计算每一行的高度
    const rowHeights = [];
    handleTr(this.originTable.el, ({ tr }) => {
      rowHeights.push(tr.children[0].getBoundingClientRect().height);
    });
    this.tables.forEach((table) => {
      /* eslint-disable no-param-reassign*/
      handleTr(table.el, ({ tr, trIndex }) => {
        tr.style.height = `${rowHeights[trIndex]}px`;
      });
    });

    // 计算ul相对于视窗的位置
    // 考虑到和父元素class联动等，必须放在目标元素sibling的位置
    // 考虑到table 相对移动或者transform时ul会错位，必须用绝对定位
    // 所以选择position 为fixed,相对视窗定位，所以不需要加window.pageYoffset了
    const originRect = this.originTable.el.getBoundingClientRect();
    // http://stackoverflow.com/questions/20514596/document-documentelement-scrolltop-return-value-differs-in-chrome
    this.el.style.top = `${originRect.top}px`;
    this.el.style.left = `${originRect.left}px`;
  }
}