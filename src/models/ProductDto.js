import moment from "moment";
const ProductDto= {
    ProductId: 0
    ,ProductCode: ''
    ,Description: ''
    ,Model :''
    ,ProductType : ''
    ,Inch : ''
    ,ModelName : ''
    ,ProductTypeName: ''
    , isActived: true
    , createdBy: null
    , modifiedBy: null
    , createdDate: moment.utc()
    , modifiedDate: moment.utc()
    , row_version: null
}

export default ProductDto