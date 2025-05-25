import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { addPatient } from "@/db/database";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { v4 as uuidV4 } from "uuid";

const validationSchema = Yup.object({
  firstName: Yup.string().max(50).required("Required"),
  lastName: Yup.string().max(50).required("Required"),
  dob: Yup.date().required("Required"),
  gender: Yup.string().required("Required"),
  bloodGroup: Yup.string().required("Required"),
  address: Yup.string().max(200).required("Required"),
  city: Yup.string().max(50).required("Required"),
  state: Yup.string().max(50).required("Required"),
  country: Yup.string().max(50).required("Required"),
  phone: Yup.string().max(20).required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  insurance: Yup.string().max(50),
  policyNumber: Yup.string().max(50),
  medicalHistory: Yup.string().max(500),
});

const PatientForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await addPatient(values);
      toast.success("Patient registered successfully!");
      navigate("/patients");
    } catch (error) {
      toast.error(
        `Failed to register patient: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Card className="flex-1 shadow-none rounded-none border-0 overflow-hidden">
        <CardContent className="p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Patient Registration</h2>
            <Separator className="mt-2" />
          </div>

          <Formik
            initialValues={{
              id: uuidV4(),
              firstName: "",
              lastName: "",
              dob: "",
              gender: "",
              bloodGroup: "",
              address: "",
              city: "",
              state: "",
              country: "",
              phone: "",
              email: "",
              insurance: "",
              policyNumber: "",
              medicalHistory: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form id="patient-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Field
                      name="firstName"
                      as={Input}
                      id="firstName"
                      placeholder="e.g. John"
                      maxLength={50}
                    />
                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Field
                      name="lastName"
                      as={Input}
                      id="lastName"
                      placeholder="e.g. Doe"
                      maxLength={50}
                    />
                    <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Field
                      name="dob"
                      as={Input}
                      type="date"
                      id="dob"
                      max={new Date().toISOString().split("T")[0]}
                    />
                    <ErrorMessage name="dob" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Field as="select" name="gender" id="gender" className="w-full border p-2 rounded-md">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Field as="select" name="bloodGroup" id="bloodGroup" className="w-full border p-2 rounded-md">
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </Field>
                    <ErrorMessage name="bloodGroup" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Field
                      name="address"
                      as={Textarea}
                      id="address"
                      rows={2}
                      maxLength={200}
                      placeholder="Street, Apt, etc."
                    />
                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Field name="city" as={Input} id="city" maxLength={50} placeholder="e.g. New York" />
                    <ErrorMessage name="city" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Field name="state" as={Input} id="state" maxLength={50} placeholder="e.g. NY" />
                    <ErrorMessage name="state" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Field name="country" as={Input} id="country" maxLength={50} placeholder="e.g. USA" />
                    <ErrorMessage name="country" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Field name="phone" as={Input} id="phone" maxLength={20} placeholder="e.g. +1 555-555-5555" />
                    <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Field name="email" as={Input} id="email" type="email" maxLength={100} placeholder="e.g. john@example.com" />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="insurance">Insurance</Label>
                    <Field name="insurance" as={Input} id="insurance" maxLength={50} placeholder="e.g. Blue Cross" />
                    <ErrorMessage name="insurance" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Field name="policyNumber" as={Input} id="policyNumber" maxLength={50} placeholder="e.g. 12345678" />
                    <ErrorMessage name="policyNumber" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="medicalHistory">Medical History</Label>
                    <Field
                      name="medicalHistory"
                      as={Textarea}
                      id="medicalHistory"
                      rows={3}
                      maxLength={500}
                      placeholder="Any past illnesses, allergies, or chronic conditions..."
                    />
                    <ErrorMessage name="medicalHistory" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 bg-white border-t p-4 shadow-md">
        <div className="flex gap-4">
          <Button
            type="submit"
            form="patient-form"
            className="flex-1 bg-[#393D9D] hover:bg-[#2f3488] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/patients")}
          >
            Cancel
          </Button>
        </div>
      </div>

    </div>
  );
};

export default PatientForm;
