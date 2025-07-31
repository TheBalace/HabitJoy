import AuthForm from "../components/Authform";

const SignupPage = () => {
    const handleSignup = async(formData) => {
        try{
            const res = await fetch("http://localhost:5000/api/signup", {
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify(formData),
            })
            const data = await res.json();
                localStorage.setItem("token", data.token);
                window.location.href = "/dashboard";
        }
        catch(error){
            alert("Something Went Wrong!");
        }
    };

    return (
        <div>
        <AuthForm type = "signup" onSubmit = {handleSignup} />
        </div>
    );
};

export default SignupPage;