import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Col, Row } from "react-bootstrap";
import { ErrorMessage } from "@hookform/error-message";
import PostForm from './../services/post-form.js';

let renderCount = 0;

export default function EventHookForm() {
  const { register, handleSubmit, errors, control } = useForm({
    criteriaMode: "all",
    defaultValues: {
      ticketTypes: [{ type: "", price: 0, quantity: 0 }]
    }
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "ticketTypes"
  });

  const fieldsOptions = ["Full Name", "Shortcode", "Email", "Contact Number", "Food Allergies"];

  const camelize = (text) => {
    text = text.replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    return text.substr(0, 1).toLowerCase() + text.substr(1);
  }

  const onSubmit = (data) => {
    var temp = {
      fullName: false,
      shortcode: false,
      email: false,
      contactNumber: false,
      foodAllergies: false
    }
    data.fieldsChecked.forEach(option => {
      temp[camelize(option)] = true;
    })
    data.fieldsChecked = temp;
    console.log(data);
    PostForm(data);
  }; // your form submit function which will invoke after successful validation

  // console.log(watch("eventName")); // you can watch individual input by pass the name of the input

  renderCount++;

  return (
    <div className="eventFormMain">
      <span className="counter">Render Count: {renderCount}</span>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Event Information</h1>
        <div className="eventFormSection">
          <Row>
            <Col>
              <label>Event Name</label>
              <input
                className="fieldInput"
                name="eventName"
                placeholder="Enter an event name"
                ref={register({ required: true })}
              />
              {errors.eventName && <p className="eventFormErrorMessage">This field is required</p>}
            </Col>
            <Col>
              <label>Event Date</label>
              <input
                className="fieldInput"
                name="eventDate"
                placeholder="Choose date and time"
                type="date"
                ref={register({ required: true })}
              />
              {errors.eventDate && <p className="eventFormErrorMessage">This field is required</p>}              
            </Col>
          </Row>
          <Row>
            <Col>
              <label>Event Details</label>
              <textarea
                className="fieldInput"
                name="eventDetails"
                placeholder="Enter some event details"
                rows="3"
                ref={register({ required: true })}
              />
              {errors.eventDetails && <p className="eventFormErrorMessage">This field is required</p>}              
            </Col>
            <Col>
              <div>
                <label>Ticket Release</label>
                <input
                  className="fieldInput"
                  name="ticketRelease"
                  placeholder="Choose date and time"
                  type="date"
                  ref={register({ required: true })}
                  // ref={register({
                  //   required: <p className="eventFormErrorMessage">This field is required</p>,
                  //   validate: value => value.isBefore(eventDate)|| <p className="eventFormErrorMessage">Ticket release date should be before actual event date</p>
                  // })}
                />
                {errors.ticketRelease && <p className="eventFormErrorMessage">This field is required</p>}  
              </div> 
              <div>
                <label>Paymen Information</label>
                <input
                  className="fieldInput"
                  name="paymentInfo"
                  placeholder="Payment information"
                  ref={register({ required: true })}
                />
                {errors.paymentInfo && <p className="eventFormErrorMessage">This field is required</p>}
              </div>
            </Col>
          </Row>
        </div>
        <br />

        <h1>Ticket Information</h1>
        <div className="eventFormSection">
          <h5>Add ticket types</h5>
          {fields.map((ticket, index) => {
            return (
              <div key={ticket.id}>
                <Row>
                  <Col>
                    <input
                      className="fieldInput"
                      name={`ticketTypes[${index}].type`}
                      placeholder="Ticket Type"
                      // defaultValue={`${ticket.type}`} // make sure to set up defaultValue
                      ref={register({ required:<p className="eventFormErrorMessage">This field is required</p> })}
                    />
                    <ErrorMessage errors={errors} name={`ticketTypes[${index}].type`} />
                  </Col>
                  <Col>
                    <input
                      className="fieldInput"
                      name={`ticketTypes[${index}].price`}
                      placeholder="Ticket Price"
                      // defaultValue={`${ticket.type}`} // make sure to set up defaultValue
                      ref={register({
                        required: <p className="eventFormErrorMessage">This field is required</p>,
                        pattern: {
                          value: /^-{0,1}\d+$/,
                          message: <p className="eventFormErrorMessage">This field is number only</p>
                        }
                      })}
                    />
                    <ErrorMessage
                      errors={errors}
                      name={`ticketTypes[${index}].price`}
                    />
                  </Col>
                  <Col>
                    <input
                      className="fieldInput"
                      name={`ticketTypes[${index}].quantity`}
                      type="number"
                      placeholder="Quantity"
                      // defaultValue={`${ticket.quantity}`} // make sure to set up defaultValue
                      ref={register({
                        required: <p className="eventFormErrorMessage">This field is required</p>,
                        min: {
                          value: 1,
                          message: <p className="eventFormErrorMessage">Quantity should be greater than 0</p>
                        }
                      })}
                    />
                    <ErrorMessage
                      errors={errors}
                      name={`ticketTypes[${index}].quantity`}
                    />
                  </Col>
                  <Col>
                      {fields.length > 1 ? (
                      <button type="button" onClick={() => remove(index)}>
                        X
                      </button>
                      ) : (
                      null
                      )}
                  </Col>
                </Row>
                {/* <Controller
                  as={<input />}
                  name={`ticketTypes[${index}].price`}
                  control={control}
                  placeholder="Price"
                  defaultValue={ticket.price} // make sure to set up defaultValue
                /> */}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => {
              append();
            }}
          >
            Add another ticket
          </button>
        </div>
        <br />

        <h1>Sign Up Form</h1>

        <div className="eventFormSection">
          <h5>Select default fields to add to sign up form</h5>
          <div>
            {fieldsOptions.map((option) => (
              <div key={option}>
                <input
                  className="checkboxInput"
                  type="checkbox"
                  value={option}
                  name="fieldsChecked"
                  ref={register}
                  defaultChecked={true}
                />
                <label>{option}</label>
              </div>
            ))}
          </div>
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}