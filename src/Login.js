import React, { useState } from "react";
import axios from "axios";

// const handleSubmit = async (ev) => {
//   ev.preventDefault();
//   try {
//     const res = await axios.put("/auth/local/login", {
//       ...this.state.values,
//     });

//     if (res.data.error) {
//       this.handleErrors(res.data.error);
//     } else {
//       this.props._loginUser(res.data);
//       window.history.back();
//     }
//   } catch (err) {
//     if (err.message.includes("401")) {
//       this.handleErrors({ auth: "Invalid email or password." });
//     } else {
//       console.error(err);
//     }
//   }
// };

const Login = (handleSubmit) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const onSubmit = (ev) => {
    ev.preventDefault();
    console.log(email, password);
    try {
      axios.get("/auth", {
        email,
        password,
      });
    } catch (ex) {
      setError(ex.response.data.message);
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      // method="GET" action={"/auth/google"}
    >
      <div>
        <input
          className="input"
          name="email"
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="Email Address"
          required
        />
      </div>
      <div>
        <input
          className="input"
          name="password"
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          placeholder="Password"
          required
        />
      </div>
      <div className="field is-centered">
        <div className="has-text-centered">
          <button type="submit">Login</button>{" "}
        </div>
      </div>
      {/* <div>
        <Google />
      </div> */}
    </form>
  );
};

export default Login;