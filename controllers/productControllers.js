import {v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js"




const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

    console.log("Incoming Product Data:", {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    });

    
    if (!name || !description || !price || !category || !subCategory) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    
    const files = [req.files?.image1?.[0], req.files?.image2?.[0], req.files?.image3?.[0], req.files?.image4?.[0]];
    const images = files.filter(Boolean);

    if (images.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required" });
    }

    
    const imageUrls = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
          folder: "products",
        });
        return result.secure_url;
      })
    );

    
    let parsedSizes = ["S", "M", "L", "XL", "2XL"];
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes); 
      } catch {
        parsedSizes = sizes.split(",").map((s) => s.trim().toUpperCase()); 
      }
    }

    
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      subCategory: subCategory.trim(),
      bestseller: bestseller === "true",
      sizes: parsedSizes,
      image: imageUrls,
      date: Date.now(),
    };

    
    const product = new productModel(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: " Product added successfully!",
      product,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};







const listProduct = async (req, res) => { 
    try {
        
        const products = await productModel.find({});
        res.json({success: true, products})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}


const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message: 'Product Removed'});
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}


const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({success: true, product});
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export {addProduct, removeProduct, listProduct, singleProduct}