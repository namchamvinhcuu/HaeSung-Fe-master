import moment from "moment";
const ProductDto= {
    MaterialId: 0
    ,MaterialCode: ''
    ,Description: ''
    ,Model:0
    ,ProductType: 0
    ,Inch : ''
    ,ModelName: ''
    ,ProductTypeName: ''
    , isActived: true
    , createdBy: null
    , modifiedBy: null
    , createdDate: moment.utc()
    , modifiedDate: moment.utc()
    , row_version: null
}

export default ProductDto