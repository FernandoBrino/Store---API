const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({price:{$gt:30}})
    .sort("price")
    .select("name price")
    .limit(10);
  res.status(200).json({ products, nbHits: products.length });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};
  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" }; //$option: 'i', the 'i' insensitivity, will match upper and lower cases
    //$regex, will match the string with query
  }
  if(numericFilters) {
    const operatorMap = {
      '>' : '$gt',
      '>=' : '$gte',
      '=' : '$eq',
      '<' : '$lte',
      '<=' : '$lt',
    }
    const regEx = /\b(<|>|>=|=|<|<=)\b/g
    let filters = numericFilters.replace(regEx,(match)=>`-${operatorMap[match]}-`);
    const options = ['price','rating'];

    filters = filters.split(',').forEach((item)=> {
      const [field,operator,value] = item.split('-');
      if(options.includes(field)){
        queryObject[field] = {[operator]:Number(value)} //console.log(queryObject);
      }
    })
    console.log(queryObject);
  }

  //if the query exists will put in queryObject returning correspondent data, otherwise
  //queryObject will be an empty object, returning all objects

  let result = Product.find(queryObject);

  //sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createAt");
  }

  //select
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const products = await result;
  res.status(200).json({ products, nbHits: products.length });
};

module.exports = {
  getAllProductsStatic,
  getAllProducts,
};
