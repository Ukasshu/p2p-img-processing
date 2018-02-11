function arrayDiff(arr1, arr2) {
  return arr1.filter(x => arr2.indexOf(x) === -1)
}

module.exports = arrayDiff