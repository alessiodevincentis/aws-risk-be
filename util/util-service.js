class UtilService {
    static genericSort(array, field) {
        array.sort(function(obj1, obj2) {
            if (obj1[field] > obj2[field]) {
                return 1;
            }
            if (obj1[field] < obj2[field]) {
                return -1;
            }
            return 0;
        });
        return array;
    }
}

module.exports = UtilService;