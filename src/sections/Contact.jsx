import { useRef, useState } from "react";
const Contact = () => {

  const [Error, setError] = useState("");
  const formRef = useRef();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };
  const formInitialDetails = {
    name: "",
    email: "",
    message: "",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response = await fetch("https://thompsonsolomonmailserver.onrender.com/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(form),
      });
      console.log(response);
      alert("Thank you. I will get back to you as soon as possible.");
      setLoading(false);
      setError("");
      setForm(formInitialDetails);
    } catch (error) {
      alert(error);
      setError(error.message);
      setLoading(false);
      setForm(formInitialDetails);
    }
  };
  return (
    <section>
      <div
        id="Contact"
        className="g7 relative pb-32 pt-24 max-lg:pb-24 max-md:py-16"
      >
        <div className="container">
          <div className="flex items-center ">
            <div className="relative border-2 border-s5 p-3 rounded-14 mr-6 flex-540 max-xl:flex-280 max-lg:flex256 max-md:flex-100">
              <div className="mb-1">
                <img
                  src="/images/xora.svg"
                  width={160}
                  height={55}
                  alt="xora"
                />
              </div>
              <div
                className="flex-[0.75] p-8 rounded-2xl"
              >
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="mt-12 flex flex-col gap-8"
                >
                  {Error && <div style={{ color: "tomato" }}>{Error}</div>}
                  <label className="flex flex-col">
                    <span className="text-p4 font-medium mb-4">Your Name</span>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="What's your good name?"
                      className="bg-tertiary py-4 px-6 placeholder:text-secondary text-p4 rounded-lg outline-none border-none font-medium"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-white font-medium mb-4">Your email</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="What's your web address?"
                      className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-white font-medium mb-4">Your Message</span>
                    <textarea
                      rows={7}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="What you want to say?"
                      className="bg-tertiary py-4 px-6 placeholder:text-secondary  text-black rounded-lg outline-none border-none font-medium"
                    />
                  </label>

                  <button
                    type="submit"
                    className="bg-p2 py-1.5 px-10 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary"
                  >
                    {loading ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>


            
            </div>

            <div className="mb-5 max-md:hidden">
              <div className="download_preview-before download_preview-after rounded-40 relative w-[955px]  p-6">
                <div className="relative rounded-3xl bg-s1 px-6 pb-6 pt-14">
                  <span className="download_preview-dot left-6 bg-p2" />
                  <span className="download_preview-dot left-11 bg-s3" />
                  <span className="download_preview-dot left-16 bg-p1/15" />

                  <img
                    src="/images/screen.jpg"
                    width={855}
                    height={655}
                    alt="screen"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};
export default Contact;
