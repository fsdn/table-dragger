/**
 * Created by lijun on 2016/12/14.
 */
import tableDragger from '../src/index';

tableDragger(document.querySelector('#default-table'), { animation: 300, mode: 'free', onlyBody: true });