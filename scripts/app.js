const Service = function () {
    this.getData = () => {
        return fetch('https://restcountries.eu/rest/v2/all')
                .then((response) => {
                    return response.json()
                })
    }
}

const DataTable = function (config) {
    this.filteredData = [...config.data]
    this.currentView = []
    this.filterObj = {}
    this.page = {
        pageNumber: 1,
        pageSize: config.pageSize[0],
        pageArray: [1, 2, 3, 4, 5]
    }
    this.getPaginationTemplate = (selectedSize, startIndex, endIndex) => {
        const data = [...this.filteredData]
        let lastPage = 0
        if (data && data.length) {
            lastPage = Math.ceil(data.length/selectedSize)
        }
        let buttonsTemplate = ''
        for (let index = startIndex; index <= endIndex; index++) {
            buttonsTemplate += `<span class="page-buttons">${index}</span>`
        }
        let template = `
            <span id="prev-button" class="page-buttons-broad">Prev</span>
                ${buttonsTemplate}
            <span id="next-button" class="page-buttons-broad">Next</span>`
        if (lastPage > endIndex) {
            template = `
            <span id="prev-button" class="page-buttons-broad">Prev</span>
            ${buttonsTemplate}...<span class="page-buttons last-button">${lastPage}</span>
            <span id="next-button" class="page-buttons-broad">Next</span>`
        }
        return template
    }

    this.generateTableSearchBar = () => {
        const { pageSize } = config
        let optionTemplate = ''
        for (const size of pageSize) {
            optionTemplate += `<option value="${size}">${size}</option>`
        }
        const pageSelector = `
            <div>
                Show <select id="select-page-size">${optionTemplate}</select> entries
            </div>`
        const searchBar = `
            <div>Search: <input id="search-input"/></div>`
        return `${pageSelector}${searchBar}`
    }

    this.generateTableHeaders = () => {
        let headerCols = ''
        const { cols } = config
        let headerFilterCols = ''
        for (const col of cols) {
            headerCols += `
            <th class="table-header">
                <span>${col.colDisplayName}</span>
                <span class="sorter hide">↑</span>
            </th>`
            headerFilterCols += `
            <th>
                <input type="text" class="header-inputs" id="input_${col.colName}" />
            </th>`
        }
        const tableHeader = `
            <div class="border-bottom">
                <table>
                    <thead>
                        <tr>${headerCols}</tr>
                    </thead>
                </table>
            </div>`
        const tableHeaderFilter = `
            <div class="border-bottom">
                <table>
                    <thead>
                        <tr>${headerFilterCols}</tr>
                    </thead>
                </table>
            </div>`
        return `${tableHeader}${tableHeaderFilter}`
    }

    this.generateTable = () => {
        const data = [...this.currentView]
        const { cols } = config
        if (cols && cols.length && data && data.length) {
            let rows = ''
            for (const row of data) {
                let eachRow = '<tr>'
                for (const col of cols) {
                    eachRow += `<td>${row[col.colName]}</td>`
                }
                eachRow += '</tr>'
                rows += eachRow
            }
            return `<tbody>${rows}</tbody>`
        } else {
            return '<div class="no-data">No table data available</div>'
        }
    }

    this.compileTable = () => {
        const { pageSize } = config
        this.page.pageSize = pageSize[0]
        this.updateCurrentTableState()
        return `
            <div class="table-search-bar padd-ar-10">${this.generateTableSearchBar()}</div>
            ${this.generateTableHeaders()}
            <div class="border-bottom table-content">
                <table id="table-data" cellspacing=0>${this.generateTable()}</table>
            </div>
            <div id="pagination-bar">
                <div class="ta-c padd-ar-10">Showing ${((this.page.pageNumber - 1) * this.page.pageSize) + 1} to ${((this.page.pageNumber - 1) * this.page.pageSize) + this.page.pageSize} of ${this.filteredData.length} entries </div>
                <div class="ta-c padd-ar-10">
                    ${this.getPaginationTemplate(this.page.pageSize, this.page.pageArray[0], this.page.pageArray[this.page.pageArray.length - 1])}
                </div>
            </div>`
    }

    this.updatePaginationTemplate = () => {
        document.getElementById('pagination-bar').innerHTML = `
            <div class="ta-c padd-ar-10">Showing ${((this.page.pageNumber - 1) * this.page.pageSize) + 1} to ${((this.page.pageNumber - 1) * this.page.pageSize) + this.page.pageSize} of ${this.filteredData.length} entries </div>
            <div class="ta-c padd-ar-10">
                ${this.getPaginationTemplate(this.page.pageSize, this.page.pageArray[0], this.page.pageArray[this.page.pageArray.length - 1])}
            </div>`
        this.addPaginationBehaviour()
    }

    this.updateTable = () => {
        if (document.getElementById('table-data')) {
            document.getElementById('table-data').innerHTML = this.generateTable()
        }
    }

    this.addSortingBehaviour = () => {
        const headers = document.getElementsByClassName('table-header')
        for (const header of headers) {
            let conf = {}
            for (const col of cols) {
                const { colDisplayName } = col
                if (header.innerText === colDisplayName) {
                    conf = col
                }
            }
            const { sortable, colName } = conf
            if (sortable) {
                header.addEventListener('click', e => {
                    const els = document.getElementsByClassName('sorter')
                    if (els.length) {
                        for (const el of els) {
                            el.classList.add('hide')
                        }
                    }
                    e.currentTarget.children[1].classList.remove('hide')
                    if (e.currentTarget.children[1].classList.contains('asc')) {
                        e.currentTarget.children[1].classList.remove('asc')
                        e.currentTarget.children[1].classList.add('desc')
                        this.sortTable(colName, 'desc')
                    } else {
                        e.currentTarget.children[1].classList.remove('desc')
                        e.currentTarget.children[1].classList.add('asc')
                        this.sortTable(colName, 'asc')
                    }
                })
            }
        }
    }

    this.addSortingBehaviour = () => {
        const headers = document.getElementsByClassName('table-header')
        const { cols } = config
        for (const header of headers) {
            let conf = {}
            for (const col of cols) {
                const { colDisplayName } = col
                if (header.innerText === colDisplayName) {
                    conf = col
                }
            }
            const { sortable, colName } = conf
            if (sortable) {
                header.addEventListener('click', e => {
                    const els = document.getElementsByClassName('sorter')
                    if (els.length) {
                        for (const el of els) {
                            el.classList.add('hide')
                        }
                    }
                    e.currentTarget.children[1].classList.remove('hide')
                    if (e.currentTarget.children[1].classList.contains('asc')) {
                        e.currentTarget.children[1].classList.remove('asc')
                        e.currentTarget.children[1].classList.add('desc')
                        this.sortTable(colName, 'desc')
                    } else {
                        e.currentTarget.children[1].classList.remove('desc')
                        e.currentTarget.children[1].classList.add('asc')
                        this.sortTable(colName, 'asc')
                    }
                })
            }
        }
    }

    this.addFilteringBehaviour = () => {
        const headers = document.getElementsByClassName('header-inputs')
        const { cols } = config
        for (const header of headers) {
            let conf = {}
            for (const col of cols) {
                const { colName } = col
                if (header.id.split('_')[1] === colName) {
                    conf = col
                }
            }
            const { filterable, colName } = conf
            if (filterable) {
                header.addEventListener('keyup', e => {
                    const inputVal = e.currentTarget.value
                    const filterObj = {...this.filterObj}
                    filterObj[colName] = inputVal.toLowerCase()
                    this.filterTable(filterObj)
                })
            } else {
                console.log('non-filterable')
            }
        }
    }

    this.setPageNumberActive = text => {
        const els = document.getElementsByClassName('page-buttons')
        if (els.length) {
            for (const el of els) {
                if (el.innerText == this.page.pageNumber) {
                    el.classList.add('active')
                } else {
                    el.classList.remove('active')
                }
            }
        }
    }

    this.addPaginationBehaviour = () => {
        const edgeButtons = document.getElementsByClassName('page-buttons-broad')
        const pageButtons = document.getElementsByClassName('page-buttons')
        edgeButtons[0].addEventListener('click', e => {
            if(this.page.pageNumber <= 1) {
                return
            }
            this.page.pageNumber = this.page.pageNumber - 1
            if (this.page.pageNumber < this.page.pageArray[0]) {
                this.page.pageArray.length = 0
                for (let index = this.page.pageNumber; index > (this.page.pageNumber - 5); index--) {
                    if (index >= 0) {
                        this.page.pageArray.push(index)
                    }
                }
                this.page.pageArray.reverse()
            }
            this.updatePaginationTemplate()
            this.setPageNumberActive()
            if (this.page.pageNumber <= 1) {
                document.getElementById('prev-button').classList.add('disabled-button')
            } else {
                document.getElementById('next-button').classList.remove('disabled-button')
            }
            this.updateCurrentTableState()
        })
        edgeButtons[1].addEventListener('click', e => {
            const endIndex = Math.ceil(this.filteredData.length/this.page.pageSize)
            if(this.page.pageNumber >= endIndex) {
                return
            }
            this.page.pageNumber = this.page.pageNumber + 1
            if (this.page.pageNumber > this.page.pageArray[this.page.pageArray.length - 1]) {
                this.page.pageArray.length = 0
                for (let index = this.page.pageNumber; index < (this.page.pageNumber + 5); index++) {
                    if (index <= endIndex) {
                        this.page.pageArray.push(index)
                    }
                }
            }
            this.updatePaginationTemplate()
            this.setPageNumberActive()
            if (this.page.pageNumber >= endIndex) {
                document.getElementById('next-button').classList.add('disabled-button')
            } else {
                document.getElementById('prev-button').classList.remove('disabled-button')
            }
            this.updateCurrentTableState()
        })
        for (const button of pageButtons) {
            button.addEventListener('click', e => {
                console.log(e.currentTarget.innerText)
                const pageNum = parseInt(e.currentTarget.innerText)
                this.page.pageNumber = pageNum
                this.updateCurrentTableState()
                const endIndex = Math.ceil(this.filteredData.length/this.page.pageSize)
                if (e.currentTarget.classList.contains('last-button')) {
                    this.page.pageArray.length = 0
                    const last = endIndex%5 === 0 ? 5 : endIndex%5
                    for (let index = this.page.pageNumber; index > this.page.pageNumber - last; index--) {
                        if (index <= this.page.pageNumber) {
                            this.page.pageArray.push(index)
                        }
                    }
                    this.page.pageArray.reverse()
                }
                this.updatePaginationTemplate()
                this.setPageNumberActive()
                if (this.page.pageNumber >= endIndex) {
                    document.getElementById('next-button').classList.add('disabled-button')
                } else if (this.page.pageNumber <= 1) {
                    document.getElementById('prev-button').classList.add('disabled-button')
                } else {
                    document.getElementById('next-button').classList.remove('disabled-button')
                    document.getElementById('prev-button').classList.remove('disabled-button')
                }
            })
        }
    }

    this.bindTemplate = () => {
        const { id } = config
        const el = document.getElementById(id)
        if (id && el) {
            el.innerHTML = this.compileTable()
        }
        this.addSortingBehaviour()
        this.addFilteringBehaviour()
        this.addGlobalSearch()
        this.addPaginationBehaviour()
        document.getElementById('prev-button').classList.add('disabled-button')
        this.setPageNumberActive()
        this.pageSelector()
    }

    this.addGlobalSearch = () => {
        document.getElementById('search-input').addEventListener('keyup', e => {
            this.searchTable(e.currentTarget.value)
        })
    }

    this.sortTable = (col, type) => {
        const data = [...this.filteredData]
        if (type === 'asc') {
            data.sort((a, b) => {
                if (a[col] < b[col]) {
                    return -1;
                }
                if (b[col] < a[col]) {
                    return 1;
                }
                return 0;
            })
        } else {
            data.sort((a, b) => {
                if (a[col] > b[col]) {
                    return -1;
                }
                if (b[col] > a[col]) {
                    return 1;
                }
                return 0;
            })
        }
        this.filteredData = data
        this.updateCurrentTableState()
    }

    this.filterTable = filter => {
        const { data } = config
        this.filterObj = {...filter}
        this.filteredData = [...data]
        const filterKeys = Object.keys(filter)
        for (const key of filterKeys) {
            this.filteredData = this.filteredData.filter(el => {
                if (el[key].toString().toLowerCase().indexOf(filter[key]) > -1) {
                    return el
                }
            })
        }
        console.log(filter)
        this.page = {
            pageNumber: 1,
            pageSize: this.page.pageSize,
            pageArray: this.page.pageArray
        }
        this.updateCurrentTableState()
        this.updatePaginationTemplate()
        this.setPageNumberActive()
    }

    this.searchTable = val => {
        const { data, cols } = config
        this.filterObj = {}
        this.filteredData = [...data]
        
        this.filteredData = this.filteredData.filter(el => {
            for (const col of cols) {
                const { colName } = col
                if (el[colName].toString().indexOf(val) > -1) {
                    return el
                }
            }
        })
        if (this.page.pageNumber !== 1) {
            this.page.pageNumber = 1
        }

        const els = document.getElementsByClassName('header-inputs')
        for (const input of els) {
            input.value = ''
        }
        this.updateCurrentTableState()
        this.updatePaginationTemplate()
        this.setPageNumberActive()
    }

    this.updateCurrentTableState = () => {
        const data = [...this.filteredData]
        this.currentView = data.slice((this.page.pageNumber - 1) * this.page.pageSize, this.page.pageNumber * this.page.pageSize)
        this.updateTable()
    }

    this.pageSelector = () => {
        document.getElementById('select-page-size').addEventListener('change', e => {
            this.page.pageSize = parseInt(e.currentTarget.value)
            if (this.page.pageNumber !== 1) {
                this.page.pageNumber = 1
            }
            this.updateCurrentTableState()
            this.updatePaginationTemplate()
            this.setPageNumberActive()
        })
    }
}

const initiateApp = async () => {
    const dataSet = new Service()
    const countriesData = await dataSet.getData()
    const config = {
        data: countriesData,
        id: 'data-table',
        cols: [{
            colName: 'name',
            colDisplayName: 'Country Name',
            filterable: true,
            sortable: true
        }, {
            colName: 'capital',
            colDisplayName: 'Capital',
            filterable: true,
            sortable: false
        }, {
            colName: 'region',
            colDisplayName: 'Region',
            filterable: true,
            sortable: true
        }, {
            colName: 'subregion',
            colDisplayName: 'Sub-region',
            filterable: true,
            sortable: false
        }, {
            colName: 'population',
            colDisplayName: 'Population',
            filterable: true,
            sortable: true
        }],
        pageSize: [5, 10, 15, 20, 25]
    }
    const view = new DataTable(config)
    view.bindTemplate()
}

initiateApp()
    