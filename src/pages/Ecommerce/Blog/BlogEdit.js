// src/pages/Blog/BlogEdit.js

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Input,
  Label,
  Form,
  FormFeedback,
  Button,
  CardHeader,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Import Lottie and animations
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";
import axios from "axios";

const BlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Added isLoading state

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true); // Start loading
        const response = await axios.get(`http://localhost:5001/blogs/${id}`);
        const blog = response;
        setBlogData(blog);

        // Fetch existing image URL
        
        setExistingImageUrl(response.image);
      } catch (error) {
        console.error("Failed to fetch blog:", error);
        toast.error("Failed to fetch blog data");
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    fetchBlog();
  }, [id]);

  // Formik validation schema
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: blogData?.title || "",
      author: blogData?.author || "",
      tags: blogData?.tags ? blogData.tags.join(",") : "",
      content: blogData?.content || "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Please enter a news title"),
      author: Yup.string().required("Please enter the author name"),
      tags: Yup.string().required("Please enter tags"),
      content: Yup.string().required("Please enter the content"),
    }),
    onSubmit: async (values) => {
      try {
 
        const formData = new FormData();
        formData.append("image", selectedFile);  // Append the single file directly

        Object.entries(values).forEach(([key, value]) => formData.append(key, value));
        // Update the category in the Appwrite database
        await axios.put(`http://localhost:5001/blogs/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Blog updated successfully");
        navigate("/bloglist");
      } catch (error) {
        console.error("Error updating blog:", error);
        toast.error("Failed to update blog. Please try again.");
      }
    },
  });

  // Handle file upload using useDropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setFileRejectionErrors([]);
        setExistingImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    onDropRejected: (fileRejections) => {
      setSelectedFile(null);
      const errors = fileRejections.map((fileRejection) => {
        return fileRejection.errors.map((error) => error.message).join(", ");
      });
      setFileRejectionErrors(errors);
    },
      });
      
      const renderLoadingAnimation = () => (
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
          <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} loop={true} />
          <div className="mt-3">
            <h5>Loading data!</h5>
          </div>
        </div>
      );
    
      // Helper to render No Results Animation
      const renderNoResultsAnimation = () => (
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
          <Lottie animationData={noDataAnimation} style={{ width: 150, height: 150 }} loop={true} />
          <div className="mt-3">
            <h5>No orders found.</h5>
          </div>
        </div>
      );
  // Show loading state
  if (isLoading) {
    return (
      renderLoadingAnimation()
    );
  }

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Edit News" pageTitle="News" />
        <Form onSubmit={validation.handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  {/* News Title */}
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="news-title-input">
                      News Title <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="news-title-input"
                      placeholder="Enter news title"
                      name="title"
                      value={validation.values.title}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        validation.errors.title && validation.touched.title
                          ? true
                          : false
                      }
                    />
                    {validation.errors.title && validation.touched.title ? (
                      <FormFeedback type="invalid">
                        {validation.errors.title}
                      </FormFeedback>
                    ) : null}
                  </div>

                  {/* Author Name */}
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="author-name-input">
                      Author Name <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="author-name-input"
                      placeholder="Enter author name"
                      name="author"
                      value={validation.values.author}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        validation.errors.author && validation.touched.author
                          ? true
                          : false
                      }
                    />
                    {validation.errors.author && validation.touched.author ? (
                      <FormFeedback type="invalid">
                        {validation.errors.author}
                      </FormFeedback>
                    ) : null}
                  </div>

                  {/* Tags */}
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="tags-input">
                      Tags (separated with a comma){" "}
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="tags-input"
                      placeholder="Enter tags"
                      name="tags"
                      value={validation.values.tags}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        validation.errors.tags && validation.touched.tags
                          ? true
                          : false
                      }
                    />
                    {validation.errors.tags && validation.touched.tags ? (
                      <FormFeedback type="invalid">
                        {validation.errors.tags}
                      </FormFeedback>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <Label className="form-label">
                      Content <span className="text-danger">*</span>
                    </Label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={validation.values.content || ""}
                      onChange={(event, editor) => {
                        validation.setFieldValue("content", editor.getData());
                      }}
                    />
                    {validation.errors.content && validation.touched.content ? (
                      <FormFeedback type="invalid" className="d-block">
                        {validation.errors.content}
                      </FormFeedback>
                    ) : null}
                  </div>
                </CardBody>
              </Card>

              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Featured Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...getRootProps()} className="dropzone dz-clickable">
                    <input {...getInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                      {isDragActive && (
                        <p className="mt-2 text-primary">Drop the files here...</p>
                      )}
                      {fileRejectionErrors.length > 0 && (
                        <div className="text-danger mt-2">
                          {fileRejectionErrors.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {existingImageUrl && (
                    <div className="mt-3 position-relative d-inline-block">
                      <img
                        src={existingImageUrl}
                        alt="Selected"
                        className="img-thumbnail"
                        width="200"
                      />
                      <Button
                        color="danger"
                        size="sm"
                        className="position-absolute top-0 end-0"
                        onClick={() => setExistingImageUrl(null)}
                      >
                        <i className="ri-close-line"></i>
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Submit Button */}
              <div className="text-end mb-3">
                <Button type="submit" color="success">
                  Update
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default BlogEdit;
