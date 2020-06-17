import { startsWith, trim, endsWith } from 'lodash';
import moment from 'moment';
import constants from './constants';
import * as userUtils from './user';

const formartUrl = (prefixUrl, suffixUrl) => {
    const originBaseUrl = trim(prefixUrl);
    const originUrl = trim(suffixUrl);
    const baseUrl = endsWith(originBaseUrl, '/')
        ? originBaseUrl.substr(1, originBaseUrl.length - 1)
        : originBaseUrl;

    const subUrl = startsWith(originUrl, '/') ? originUrl.substr(1) : originUrl;
    if (startsWith(baseUrl, 'http') || startsWith(baseUrl, '/')) {
        return subUrl ? `${baseUrl}/${subUrl}` : `${baseUrl}`;
    }
    return subUrl ? `/${baseUrl}/${subUrl}` : `/${baseUrl}`;
};

const taskColor = (createdDate) => {
    const days = moment().diff(createdDate, 'days');
    if (days <= 1) {
        return '#52c41a'
    }
    if (days <= 30) {
        return '#fa8c16'
    }
    return '#f5222d';
};

export { taskColor, formartUrl, constants, userUtils };
