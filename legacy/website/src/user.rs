struct User {
    pub name: String,
    age: u32,
}

impl User {
    fn new(name: String, age: u32) -> Self {
        User { name, age }
    }struct User {
    pub name: String,
    age: u32,
}

impl User {
    fn new(name: String, age: u32) -> Self {
        User { name, age }
    }

    pub fn print_info(&self) {
        println!("Name: {}, Age: {}", self.name, self.age);
    }
}
